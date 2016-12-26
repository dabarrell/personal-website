FROM ubuntu:16.04

MAINTAINER David Barrell

RUN apt-get update && apt-get install -y openssh-server apache2 supervisor
RUN mkdir -p /var/lock/apache2 /var/run/apache2 /var/run/sshd /var/log/supervisor

RUN rm /etc/apache2/sites-enabled/*
RUN apt-get install -y rsyslog

RUN echo 'root:password' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

COPY conf/apache-site.conf /etc/apache2/sites-enabled/default.conf
COPY conf/rsyslog.conf /etc/rsyslog.d/rsyslog.conf
COPY conf/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY build /var/www/html

EXPOSE 22 80
CMD ["/usr/bin/supervisord"]
