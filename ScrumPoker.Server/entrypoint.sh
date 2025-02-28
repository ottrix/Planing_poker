#!/bin/bash

# Start the .NET application
dotnet ScrumPoker.Server.dll &

# Start Nginx
nginx -g 'daemon off;'
