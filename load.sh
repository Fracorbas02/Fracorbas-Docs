#!/bin/bash

# dans un premier temps on lance npm pour monter tout ce que l'on a :
npm run build

# Ensuite, il faut que l'on copie tout ce que l'on a comme fichiers
sudo cp -r build/* /var/www/html
