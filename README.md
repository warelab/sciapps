# SciApps

To install, follow steps below (for local install, skip step 7)

  1. git clone https://github.com/warelab/sciapps.git

  2. cd sciapps/agavedancer

  3. npm install

  4. grunt

  5. sqlite3 database <models/schema.sql

  6. chmod 777 . database bin

  7. Restart apache
    
      sudo /usr/sbin/apachectl configtest or sudo /usr/local/apache2/bin/apachectl configtest    
     
      sudo /usr/sbin/apachectl graceful or sudo /usr/local/apache2/bin/apachectl graceful
      
  8. Add new app
  
      a. Develop app and test in Discovery Environment
      
      b. Copy json file into sciapps/agavedancer/public/assets/
      
      c. Add tags for the app into agaveAppsList.json file
  
      d. Update permission: apps-pems-update -v -u maizecode -p READ_EXECUTE $APP_ID
  
      e. Run live-server to test the apps before pushing to github
      
  9. Publish to SciApps.org
  
      git add .
      
      git commit
      
      git push origin master
      

