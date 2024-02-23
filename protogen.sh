#!/bin/bash

if ! yarn proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=proto/ proto/*.proto; then
    echo "Error: proto-loader-gen-types failed"
    exit 1
fi
