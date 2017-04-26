#!/bin/bash
# Deploy clicker-backend app on AWS Elasticbeanstalk.

./run.sh
eb labs cleanup-versions;
eb deploy;
