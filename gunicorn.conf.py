# Gunicorn configuration file
import multiprocessing
import os

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 100

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "course_organizer"

# Server mechanics
daemon = False
pidfile = "/tmp/gunicorn.pid"
user = None
group = None
tmp_upload_dir = None

# SSL (not needed as nginx handles SSL termination)
keyfile = None
certfile = None

# Environment variables
raw_env = [
    'DJANGO_SETTINGS_MODULE=course_organizer.settings',
]

# Preload app for better performance
preload_app = True

# Worker timeout for graceful shutdown
graceful_timeout = 120

# Enable reuse of port
reuse_port = True

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Performance tuning
worker_tmp_dir = "/dev/shm"
