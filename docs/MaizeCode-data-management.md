MaizeCode Data Management
-------
MaizeCode data are processed locally and released through the CyVerse infrastructure. Automated workflows will be constructed to process MaizeCode sequencing data with a CyVerse CSHL federation system (the SciApps system). The same workflows, once mature, will be released for the community to leverage XSEDE computing resources and CyVerse Data Store.

### Data flow
A local copy of MaizeCode data will be kept on the SciApps system to support re-analysis and workshops during the project period. Raw data will be submitted to sequence repositories with CyVerse tools/pipelines. Important results will be hosted in CyVerse Data Store, released through [MaizeCode.org](www.maizecode.org) web portal, and further curated for releasing through CyVerse Data Commons.

### SciApps system
[SciApps](https://www.sciapps.org) is a cloud based platform for building, executing, & sharing scientific applications (Apps) and workflows, powered by a federated CyVerse system at Cold Spring Harbor Laboratory. It uses [Agave API](https://agaveapi.co/) to virtualize local compute and storage servers, register metadata, and build modular bioinformatics applications. Using these modular apps, automated workflows are constructed on SciApps to improve both efficiency and reproducibility. 
* A cluster of six servers with 60 cores and 100 TB storage
* Modular apps are [optimized](Agave-SciApps.md) for local compute and data
* Data are kept locally (in CSHL) during the entire analysis cycle
* Workflows capture metadata, relationship, and history of MaizeCode data
* Apps are transferable among clouds by utilizing the [Singularity containers](Singularity-SciApps.md)
* Workflows are reproducible with a light-weight JSON file

### Metadata
A combination of Google forms, CyVerse metadata templates, and MaizeCode metadata JSON templates will be used to support collecting, management, display, and searching MaizeCode metadata.
* Google forms are used to collect metadata
* Agave metadata schemas (in JSON) are created to match the Google forms
* Metadata are converted from Google form to Agave
* Metadata are displayed on SciApps workflow diagram

### Community Access
Once mature, all MaizeCode data, apps and workflows will be made public for the community to access through the CyVerse infrastructure. For analysis submitted by Community members, data will be stored in CyVerse Data Store and processed with XSEDE computing resources.
* Annotation with [XSEDE JetStream](https://portal.xsede.org/jetstream) 
* ENCODE assays with [XSEDE HPC cluster Stampede2](https://portal.tacc.utexas.edu/user-guides/stampede2)
