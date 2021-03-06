#! /bin/bash

# Push only if it's not a pull request
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # Push only if we're testing the master or staging branch
  if [ "$TRAVIS_BRANCH" == "staging" ] || [ "$TRAVIS_BRANCH" == "master" ]; then
    # Build and push
    docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
    docker build -t davidbarrell/personal-website:$TRAVIS_BRANCH .
    echo "personal-website:$TRAVIS_BRANCH"
    docker push davidbarrell/personal-website:$TRAVIS_BRANCH
    echo "Pushed personal-website:$TRAVIS_BRANCH"
  else
    echo "Skipping deploy because branch is not 'staging' or 'master'"
  fi
else
  echo "Pull request - skipping deploy"
fi
