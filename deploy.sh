#!/bin/bash
# Deploy clicker-backend app on AWS Elasticbeanstalk.

gulp scripts;
eb labs cleanup-versions;
eb deploy;
