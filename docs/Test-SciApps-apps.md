Testing an app on SciApps.org
=============================

After [optimizing](Agave-SciApps.md) your Agave apps, the next step is to test the app to see whether it is working correctly. The app can be tested using the Discovery Environment but the data transfer will be slow, given that SciApps.org is a remote system located at Cold Spring Harbor Laboratory. Therefore, the best way to test the app is through the [Agave CyVerse SDK](https://github.com/cyverse/cyverse-sdk) directly, which will restrict the data transfer happening within CSHL, if both apps and inputs are correctly configured.

To get started, modify the following job json and save it (e.g. my-job.json):

```json
{
    "jobName": "my-test-job-01",
    "softwareName": "ConvertTraitID-0.0.1",
    "requestedTime": "47:59:59",
    "archive": false,
    "inputs": {
        "trait": "agave://sciapps.org/example_data/gwas_raw/height.txt"
    },
    "parameters": {
        "header": 0,
        "sid": "Sorghum"
    }
}
```
Note that the input url (for 'trait') starting with 'agave://sciapps.org', which is critical for speeding up data transfer. You can get this url through browsing DataStore, then public, then example_data on SciApps.org with any app form (e.g. [ConvertTraitID](https://www.sciapps.org/app_id/ConvertTraitID-0.0.0)). For new datasets, upload them with following command:

```sh
$files-mkdir -N test -S sciapps.org/example_data/gwas_raw
$files-upload -v -F myFile.txt -S sciapps.org/example_data/gwas_raw/test

# If you want to delete the file (warning: don't delete any data thats not yours)
$files-delete -S sciapps.org example_data/gwas_raw/test/myFile.txt
```

Above commands use the Agave cli, which can be installed and configured on your server with following commands. Check the [CyVerse SDK](https://github.com/cyverse/cyverse-sdk/blob/master/docs/app-dev-first-app-job.md) for more details about the job json and configuration.

```sh
$git clone https://github.com/cyverse/cyverse-sdk.git
$cd cyverse-sdk/
$make
$cd cyverse-cli
$cd bin
$./tenants-init -t iplantc.org
$./clients-create -S -v -N my_api_client -D "Client used for app development"
$auth-tokens-create -S -v
# you can add the bin folder to your path to access it from any folder
```

Now you can use the job json file to test your app.

```sh
# Submit the job for Agave to execute. Don't forget to edit softwareName, jobName, inputs and parameters
# Here's a log from an example run
$jobs-submit -F my-job.json
Successfully submitted job 3444779753963384345-242ac113-0001-007
```

Check job status
```sh
$jobs-status 3444779753963384345-242ac113-0001-007
SUBMITTING
```

Check job history
```sh
$jobs-history 3444779753963384345-242ac113-0001-007
Job accepted and queued for submission.
Attempt 1 to stage job inputs
Identifying input files for staging
Copy in progress
Job inputs staged to execution system
Preparing job for submission.
Attempt 1 to submit job
Fetching app assets from agave://data.iplantcollaborative.org/lwang/apps/tnrs/bin
Staging runtime assets to agave://sciapps.org/lwang/job-3444779753963384345-242ac113-0001-007-tnrs-02
HPC job successfully placed into debug queue as local job 9092
Job started running
Job completed execution
Job completed. Skipping archiving at user request.
```

List the output, whether it runs to completion or not (if you see any inputs, temporary files, or other unneeded files, modify your wrapper scripts to get them handled/removed)
```sh
$jobs-output 3444779753963384345-242ac113-0001-007
.agave.archive
.agave.log
tnrs-02-3444779753963384345-242ac113-0001-007.err
tnrs-02-3444779753963384345-242ac113-0001-007.out
tnrs.txt
unmapped.txt
```

Download specific files, for example the trns.txt file
```sh
jobs-output --download --path tnrs.txt 3444779753963384345-242ac113-0001-007 
```

You can get more detailed outputs from any of the Agave CLI commands by adding -v to your command line to output the JSON response, and/or by adding -V which will print STDERR to your screen.
