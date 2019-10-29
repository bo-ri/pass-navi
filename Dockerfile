FROM node:10


RUN apt-get -y update && apt-get -y upgrade

RUN apt-get install -y mecab libmecab-dev mecab-ipadic-utf8

#RUN wget https://chromedriver.storage.googleapis.com/2.37/chromedriver_linux64.zip
#RUN unzip chromedriver_linux64.zip -d ~/bin/

#ENV PATH $PATH:$HOME/bin

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable

RUN rm -rf /var/lib/apt/lists/* /var/cache/apt/*
