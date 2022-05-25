# SPOT Web Service

This is a simple python script (SPOT.py) that retrieves JSON buoy data from SPOT-0222. It is intended to run as a cgi script in Apache to serve as a reverse proxy to protect the API key needed for requests to the upstream API at sofarocean.

This python script reads the sofarocean API url and token from a config text file (SPOT.cfg) and prints out the response from that API. The config file should be in plain text in the following format (note the lack of quotes):

```bash
[general]
url: https://some.domain.com
token: sometoken
```

The included apache config file (SPOT.conf) shows the necessary directives to enable this python script as a cgi process. The python script should be in a directory that is accessible to Apache with its file permission set to 755. The script config file must be collocated with the python script with its file permission set to 640 (the file's group may need to be changed to `www-data` from `root`).

## Prerequisites
Apache2 with the `cgi` module enabled
Python3 with the the `configparser` and `requests` libraries installed