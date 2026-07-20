import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import MetaData, Table, Column, Integer, String, select, delete
from sqlalchemy.exc import SQLAlchemyError

from db import get_engine, SUPPORTED_DB_TYPES

app = Flask(__name__)

# In production, lock CORS down to your deployed frontend's origin via an
# env var instead of allowing every origin.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
CORS(app, origins=FRONTEND_URL)

# Holds the live engine + non-secret connection info for the current session.
# NOTE: this is process-global, so it's fine for a single-user/internal tool
# but is not safe for multiple people using the same deployed instance at
# once — each would overwrite the others' connection. If this needs to
# support concurrent users, move this into a per-session/token store.
state = {
    "engine": None,
    "db_type": None,
    "server": None,
    "database": None,
}

metadata = MetaData()

json_mappings = Table(
    "JsonMappings",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("mapping_name", String(255)),
    Column("source_field", String(255)),
    Column("destination_field", String(255)),
)


def require_connection():
    if state["engine"] is None:
        return jsonify({"error": "Not connected to a database yet"}), 400
    return None


# Home API
@app.route("/")
def home():
    return "Flask Backend Running"


# Connect Database
@app.route("/connect-db", methods=["POST"])
def connect_db():
    data = request.json or {}

    db_type = data.get("dbType")
    server_name = data.get("serverName")
    database_name = data.get("databaseName")
    port = data.get("port")
    username = data.get("username", "")
    password = data.get("password", "")

    if db_type not in SUPPORTED_DB_TYPES:
        return jsonify({
            "error": f"dbType must be one of: {', '.join(SUPPORTED_DB_TYPES)}"
        }), 400

    try:
        engine = get_engine(
            db_type=db_type,
            server=server_name,
            database=database_name,
            username=username,
            password=password,
            port=port,
        )

        # Test the connection and create the table if needed.
        with engine.connect() as conn:
            metadata.create_all(conn, checkfirst=True)
            conn.commit()

        state["engine"] = engine
        state["db_type"] = db_type
        state["server"] = server_name
        state["database"] = database_name

        return jsonify({"message": "Database connected successfully"})

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Save Mapping
@app.route("/save-mapping", methods=["POST"])
def save_mapping():
    err = require_connection()
    if err:
        return err

    data = request.json or {}
    mapping_name = data.get("mappingName")
    mappings = data.get("mappings")

    if not mapping_name or not mappings:
        return jsonify({"error": "mappingName and mappings are required"}), 400

    for m in mappings:
        if "sourceField" not in m or "destinationField" not in m:
            return jsonify({
                "error": "Each mapping needs sourceField and destinationField"
            }), 400

    engine = state["engine"]

    try:
        with engine.connect() as conn:
            # 1. Check duplicate mapping name
            name_exists = conn.execute(
                select(json_mappings.c.id).where(
                    json_mappings.c.mapping_name == mapping_name
                )
            ).first()

            if name_exists:
                return jsonify({"error": "Mapping name already exists"}), 400

            # 2. Check duplicate mapping structure
            existing_mappings = {}
            rows = conn.execute(
                select(
                    json_mappings.c.mapping_name,
                    json_mappings.c.source_field,
                    json_mappings.c.destination_field,
                )
            ).fetchall()

            for db_mapping_name, source_field, destination_field in rows:
                existing_mappings.setdefault(db_mapping_name, []).append(
                    (source_field, destination_field)
                )

            current_structure = sorted(
                (m["sourceField"], m["destinationField"]) for m in mappings
            )

            for existing_name, existing_structure in existing_mappings.items():
                if sorted(existing_structure) == current_structure:
                    return jsonify({
                        "error": f"Same mapping structure already exists ({existing_name})"
                    }), 400

            # 3. Save mapping
            conn.execute(
                json_mappings.insert(),
                [
                    {
                        "mapping_name": mapping_name,
                        "source_field": m["sourceField"],
                        "destination_field": m["destinationField"],
                    }
                    for m in mappings
                ],
            )
            conn.commit()

        return jsonify({"message": "Mapping saved successfully"})

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# Get Mapping Names
@app.route("/get-mappings", methods=["GET"])
def get_mappings():
    err = require_connection()
    if err:
        return err

    engine = state["engine"]
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                select(json_mappings.c.mapping_name).distinct()
            ).fetchall()
        return jsonify([row[0] for row in rows])
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# Get Mapping Details
@app.route("/get-mapping-details/<mapping_name>", methods=["GET"])
def get_mapping_details(mapping_name):
    err = require_connection()
    if err:
        return err

    engine = state["engine"]
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                select(
                    json_mappings.c.source_field,
                    json_mappings.c.destination_field,
                ).where(json_mappings.c.mapping_name == mapping_name)
            ).fetchall()

        result = [
            {"source_field": r[0], "destination_field": r[1]} for r in rows
        ]
        return jsonify(result)
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# Update Existing Mapping
@app.route("/update-mapping", methods=["POST"])
def update_mapping():
    err = require_connection()
    if err:
        return err

    data = request.json or {}
    mapping_name = data.get("mappingName")
    mappings = data.get("mappings")

    if not mapping_name or not mappings:
        return jsonify({"error": "mappingName and mappings are required"}), 400

    engine = state["engine"]
    try:
        with engine.connect() as conn:
            exists = conn.execute(
                select(json_mappings.c.id).where(
                    json_mappings.c.mapping_name == mapping_name
                )
            ).first()

            if not exists:
                return jsonify({"error": "Mapping not found"}), 404

            conn.execute(
                delete(json_mappings).where(
                    json_mappings.c.mapping_name == mapping_name
                )
            )

            conn.execute(
                json_mappings.insert(),
                [
                    {
                        "mapping_name": mapping_name,
                        "source_field": m["sourceField"],
                        "destination_field": m["destinationField"],
                    }
                    for m in mappings
                ],
            )
            conn.commit()

        return jsonify({"message": "Mapping updated successfully"})
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# Delete Mapping
@app.route("/delete-mapping", methods=["POST"])
def delete_mapping():
    err = require_connection()
    if err:
        return err

    data = request.json or {}
    mapping_name = data.get("mappingName")

    if not mapping_name:
        return jsonify({"error": "mappingName is required"}), 400

    engine = state["engine"]
    try:
        with engine.connect() as conn:
            conn.execute(
                delete(json_mappings).where(
                    json_mappings.c.mapping_name == mapping_name
                )
            )
            conn.commit()
        return jsonify({"message": "Mapping deleted successfully"})
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Local dev only. On Render, gunicorn runs the app (see Dockerfile).
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
