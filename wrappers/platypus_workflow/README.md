# Variant calling workflow

* Wrapper scripts used for building the variant calling workflow
  * [bwa-index.template](bwa-index.template) with corresponding app json: [BWA_index_cshl-0.7.13.json](../../assets/BWA_index_cshl-0.7.13.json)
  * [bwa-mem.template](bwa-mem.template) with corresponding app json: [BWA_mem_cshl-0.7.13.json](../../assets/BWA_mem_cshl-0.7.13.json)
  * [platypus.template](platypus.template) with corresponding app json: [Platypus_cshl-0.5.2.json](../../assets/Platypus_cshl-0.5.2.json)
* Job submission json files for testing 
  * [test-bwa-index-job.json](test-bwa-index-job.json)
  * [test-bwa-mem-job.json](test-bwa-mem-job.json)
  * [test-platypus-job.json](test-platypus-job.json)
* Workflow json file that can be saved and loaded at https://de.sciapps.org (local)
  * [my_platypus_workflow.json](my_platypus_workflow.json)
