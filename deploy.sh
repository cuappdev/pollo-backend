#!/bin/bash
# Deploy clicker-backend app on AWS Elasticbeanstalk.

gulp scripts;
eb deploy;
