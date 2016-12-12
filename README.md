# SciApps

To install, follow steps below

  1. git clone https://github.com/warelab/sciapps.git

  2. cd sciapps/agavedancer

  3. npm install

  4. grunt

  5. sqlite3 database <models/schema.sql

  6. chmod 777 . database bin

  7. Restart apache
    
      sudo /usr/sbin/apachectl configtest or sudo /usr/local/apache2/bin/apachectl configtest    
     
      sudo /usr/sbin/apachectl graceful or sudo /usr/local/apache2/bin/apachectl graceful
      
  8. Add json files for new app
  
      Create json files inside sciapps/agavedancer/public/assets/
      
      Add tags for the app into agaveAppsList.json file
      
      Run live-server to test the apps before pushing to github
      
      git add .
      
      git commit
      
      git push origin master
      

