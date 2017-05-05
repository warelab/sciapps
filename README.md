# SciApps

To install, follow steps below (for local install, skip step 8)

  1. git clone https://github.com/warelab/sciapps.git

  2. git checkout cd6e8991d452d7c3ef40ad681bbe4398cfb2e220
  
  3. cd sciapps/agavedancer

  4. npm install

  5. grunt

  6. sqlite3 database <models/schema.sql

  7. chmod 777 . database bin

  8. Restart apache
    
      sudo /usr/sbin/apachectl configtest or sudo /usr/local/apache2/bin/apachectl configtest    
     
      sudo /usr/sbin/apachectl graceful or sudo /usr/local/apache2/bin/apachectl graceful
      
  9. Add .agave with correct CyVerse credentials in agavedancer folder
  10. Add new app
  
      a. Develop app and test in Discovery Environment
      
      b. Copy json file into sciapps/agavedancer/public/assets/ (make sure to name it as $app_id-$version.json)
      
      c. Add the app and tags for the app into agaveAppsList.json file (tags is used to represent a category)
  
      d. Update permission: apps-pems-update -v -u maizecode -p READ_EXECUTE $APP_ID
      
      e. cd to sciapps/agavedancer/ and type `grunt` 
  
      f. cd to sciapps/agavedancer/public and type `live-server` to test the apps before pushing to github
      
  11. Publish to your own branch instead of master
  
      git stash (save local modifications)
      
      git pull (pull remote updates)
      
      git stash pop (combine)
  
      git add .
      
      git commit
      
      git push origin master
      
      or
      
      git add .
      
      git commit
      
      git pull
      
      git push origin master
      
