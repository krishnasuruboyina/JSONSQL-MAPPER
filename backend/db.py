"""
Database connection layer.

Builds a SQLAlchemy engine for whichever backend the user selects.
Windows Authentication is intentionally NOT supported here — it only works
when the app and the SQL Server are on the same domain-joined network,
which is never true for a server running on Render. Every database type
uses username/password auth.

Supported db_type values: "postgresql", "mysql", "oracle", "mssql"
"""

from sqlalchemy import create_engine


SUPPORTED_DB_TYPES = ("postgresql", "mysql", "oracle", "mssql")

DEFAULT_PORTS = {
    "postgresql": 5432,
    "mysql": 3306,
    "oracle": 1521,
    "mssql": 1433,
}


def build_connection_url(db_type, server, database, username, password, port=None):
    db_type = (db_type or "").lower().strip()

    if db_type not in SUPPORTED_DB_TYPES:
        raise ValueError(
            f"Unsupported database type '{db_type}'. "
            f"Must be one of: {', '.join(SUPPORTED_DB_TYPES)}"
        )

    port = port or DEFAULT_PORTS[db_type]

    if db_type == "postgresql":
        return f"postgresql+psycopg2://{username}:{password}@{server}:{port}/{database}"

    if db_type == "mysql":
        return f"mysql+pymysql://{username}:{password}@{server}:{port}/{database}"

    if db_type == "oracle":
        # python-oracledb runs in "thin" mode by default — no Oracle
        # Instant Client needs to be installed on the server for this to work.
        return f"oracle+oracledb://{username}:{password}@{server}:{port}/?service_name={database}"

    if db_type == "mssql":
        return (
            f"mssql+pyodbc://{username}:{password}@{server}:{port}/{database}"
            f"?driver=ODBC+Driver+17+for+SQL+Server"
        )


def get_engine(db_type, server, database, username, password, port=None):
    url = build_connection_url(db_type, server, database, username, password, port)
    # pool_pre_ping avoids "server has gone away" errors on Render's free tier,
    # which can idle connections out.
    return create_engine(url, pool_pre_ping=True)