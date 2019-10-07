# SciApps: a cloud-based platform for reproducible bioinformatics workflows
## Introduction
SciApps is a bioinformatics workflow package developed to leverage local clusters or TACC/XSEDE resources for computing and CyVerse Data Store for storage. SciApps is built on top of the Agave API that can also virtualize commercial resources, e.g., Amazon EC2/S3 for computing and storage. Both GUI and RESTful API are available for interactive or batch processing of NGS data.

## Installation of SciApps
    git clone https://github.com/warelab/sciapps.git
    cd sciapps/agavedancer
    sudo npm install -g grunt-cli
    npm install
    grunt package
    sudo /usr/sbin/apachectl graceful  

## Providing CyVerse credentials
    cd sciapps/agavedancer
    touch .agave
      .agave content:
          {"username":"XXX","password":"YYY"}
    Update defaultUser to "XXX" in agavedancer/environments/production.yml (development.yml)

## Setting up iRODS (for accessing CyVerse Data Store)
    wget ftp://ftp.renci.org/pub/irods/releases/4.1.10/centos7/irods-icommands-4.1.10-centos7-x86_64.rpm
    sudo yum install fuse fuse-libs
    sudo rpm -i irods-icommands-4.1.10-centos7-x86_64.rpm 
    cd /usr/share/httpd
    sudo touch irodsEnv
    sudo chmod 664 irodsEnv
    sudo chown apache:apache irodsEnv
      irodsEnv content:
        {
          "irods_host": "data.iplantcollaborative.org",
          "irods_user_name": "XXX",
          "irods_port": 1247,
          "irods_zone_name": "iplant",
          "irods_authentication_file": "/usr/share/httpd/irodsA"
        }
    sudo touch irodsA
    sudo chmod 664 irodsA
    sudo chown apache:apache irodsA
    sudo -u apache /bin/bash
    export IRODS_ENVIRONMENT_FILE=/usr/share/httpd/irodsEnv
    iinit

## Integrating new Apps/Tools
Follow this instruction for developing new Agave apps. And put the app json file in the following assets folder (e.g., Bismark-0.14.4.json).

    cd agavedancer/public/assets
    touch agaveAppsList.json
    agaveAppsList.json content
       {
          "tags": ["Methylation"],
          "id": "Bismark-0.14.4",
          "label": "Bismark",
          "name": "Bismark",
          "version": "0.14.4"
       },
       {
         ...
       }

## Configuring web server
SciApps.org can be configured with an Apache server using the following demo configuration file. The sciapps.conf file should be placed under /etc/httpd/conf.d/ (Centos 7) or /usr/local/apache2/conf/ (Centos 6). Note that SSL certificate is needed to be able to authenticate to the cloud systems.

    <VirtualHost 143.48.220.100:443>
        SSLEngine on
        SSLCertificateFile /etc/letsencrypt/live/www.sciapps.org/fullchain.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/www.sciapps.org/privkey.pem
        SSLCertificateChainFile /etc/letsencrypt/live/www.sciapps.org/chain.pem
        ServerName       www.sciapps.org
        ServerAlias      sciapps.org
        DocumentRoot     /home/YOURUSERNAME/sciapps/agavedancer/public
        RewriteEngine on
        RewriteRule ^/app_id/(.*)      https://www.sciapps.org/?app_id=$1 [L]
        RewriteRule ^/page/(.*)     https://www.sciapps.org/?page_id=$1 [L]
        RewriteRule ^/data/(.*)     https://www.sciapps.org/?page_id=dataWorkflows&data_item=$1 [L]

        SetEnv DANCER_ENVIRONMENT "production"
        <Directory "/home/YOURUSERNAME/sciapps/agavedancer/public">
            AllowOverride none
            Require all granted
            DirectoryIndex index.html index.php
        </Directory>
        <Location />
            SetHandler perl-script
            PerlResponseHandler Plack::Handler::Apache2
            PerlSetVar psgi_app /home/YOURUSERNAME/sciapps/agavedancer/bin/app.pl
        </Location>
    </VirtualHost>

## Citation
Wang, L., Lu, Z., Van Buren, P., & Ware, D. (2018). SciApps: a cloud-based platform for reproducible bioinformatics workflows. Bioinformatics, 34(22), 3917-3920. Link

