#!/bin/bash

set -e

host="$1"
port="$2"
user="$3"
password="$4"
dbname="$5"
cmd="$6"

export PGPASSWORD="$password"

until psql -h "$host" -p "$port" -U "$user" -d "$dbname" -c '\q'; do
  >&2 echo "PostgreSQL não está disponível - esperando..."
  sleep 2
done

>&2 echo "PostgreSQL está disponível - continuando"
exec $cmd