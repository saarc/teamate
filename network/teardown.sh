#!/bin/bash
#
# Exit on first error, print all commands.
set -e

# Shut down the Docker containers for the system tests.
#docker-compose -f docker-compose.yml kill && docker-compose -f docker-compose.yml down

# remove the local state
rm -f ~/.hfc-key-store/*

# remove chaincode docker images

cons=$(docker ps -aq)
if [ -n "$cons" ];  then
        docker rm -f $(docker ps -aq)
fi

imgs=$(docker images dev-* -q)
if [ -n "$imgs" ];  then
        docker rmi -f $(docker images dev-* -q)
fi

docker network rm net_basic



# Your system is now clean
