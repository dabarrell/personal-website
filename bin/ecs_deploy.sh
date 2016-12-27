#! /bin/bash

# Deploy only if it's not a pull request
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # Deploy only if we're testing the master branch
  if [ "$TRAVIS_BRANCH" == "staging" ]; then
    echo "Installing JQ"
    sudo apt-get install jq

    echo "Deploying $TRAVIS_BRANCH on $CLUSTER"
    ./bin/ecs-deploy -c $CLUSTER -n $SERVICE -i docker.io/davidbarrell/personal-website:$TRAVIS_BRANCH
  else
    echo "Skipping deploy because it's not an allowed branch"
  fi
else
  echo "Skipping deploy because it's a PR"
fi
