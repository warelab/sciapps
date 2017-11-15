# For SciApps main version
For security reasons, installation of SciApps on your pc is not supported. To add an Agave app, follow steps below

  1. git clone https://github.com/warelab/sciapps.git

  2. git pull
  
  3. cd sciapps/agavedancer/public/assets
  
  4. Create/move your app-id.json in this folder (or replace the old one)
      - e.g. **apps-list -v BWA_index_mem-0.7.13 > BWA_index_mem-0.7.13.json**
    
  5. Insert following content (example for **BWA_index_mem-0.7.13**) to the second line of **agaveAppsList.json** for your new app
  ```json
    {
      "tags": [
        "Beta"
      ],
      "id": "BWA_index_mem-0.7.13",
      "label": "BWA-index-mem",
      "name": "BWA_index_mem",
      "version": "0.7.13"
    },
  ```
  6. git add .
  
  7. git commit -m **"Added app BWA_index_mem-0.7.13"**
  
  8. git checkout -b 'my_branch'
  
  9. git push origin my_branch
  
  10. Share the app with the **maizecode** user
      - e.g. **apps-pems-update -v -u maizecode -p READ_EXECUTE BWA_index_mem-0.7.13**

  11. Notify support@sciapps.org

# For SciApps community version (under development)

To install, follow steps below (for local install, skip step 8)

  1. git clone https://github.com/warelab/sciapps.git

  2. git pull
  
  3. cd sciapps/agavedancer

  4. npm install
  
    a. Install node.js with b and c below if npm not found
    
    b. curl --silent --location https://rpm.nodesource.com/setup_7.x | sudo bash -
    
    c. sudo yum -y install nodejs
    

  5. grunt (if not found, sudo npm install -g grunt-cli)

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
