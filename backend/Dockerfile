FROM python:3.11-slim

# unixODBC + Microsoft's ODBC Driver 17 are required for pyodbc/SQL Server.
# Postgres (psycopg2-binary), MySQL (PyMySQL) and Oracle (oracledb, thin
# mode) don't need any extra system packages.
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl gnupg unixodbc-dev \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/12/prod.list \
        > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql17 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render sets $PORT at runtime; gunicorn binds to it.
CMD gunicorn -b 0.0.0.0:${PORT:-10000} app:app