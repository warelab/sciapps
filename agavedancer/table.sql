-- MySQL dump 10.13  Distrib 5.1.73, for redhat-linux-gnu (x86_64)
--
-- Host: localhost    Database: sciapps
-- ------------------------------------------------------
-- Server version	5.1.73

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agave_user`
--

DROP TABLE IF EXISTS `agave_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agave_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(40) NOT NULL,
  `consumerKey` varchar(40) DEFAULT NULL,
  `consumerSecret` varchar(40) DEFAULT NULL,
  `clientname` varchar(40) DEFAULT NULL,
  `token` varchar(40) DEFAULT NULL,
  `refresh_token` varchar(40) DEFAULT NULL,
  `token_expires_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `username_2` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bio_project`
--

DROP TABLE IF EXISTS `bio_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bio_project` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(128) NOT NULL,
  `sra_project_id` varchar(128) DEFAULT NULL,
  `organization_address_street` varchar(128) DEFAULT NULL,
  `organization_address_postal_code` varchar(128) DEFAULT NULL,
  `organization_address_institution` varchar(128) DEFAULT NULL,
  `organization_address_department` varchar(128) DEFAULT NULL,
  `organization_address_country` varchar(128) DEFAULT NULL,
  `organization_address_city` varchar(128) DEFAULT NULL,
  `contact_last_name` varchar(128) DEFAULT NULL,
  `contact_first_name` varchar(128) DEFAULT NULL,
  `contact_email` varchar(128) DEFAULT NULL,
  `sra_hold_release_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `uuid_2` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bio_sample`
--

DROP TABLE IF EXISTS `bio_sample`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bio_sample` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(128) NOT NULL,
  `age` varchar(128) DEFAULT NULL,
  `dev_stage` varchar(128) DEFAULT NULL,
  `cultivar` varchar(128) DEFAULT NULL,
  `ecotype` varchar(128) DEFAULT NULL,
  `isolate` varchar(128) DEFAULT NULL,
  `geo_loc_name` varchar(128) DEFAULT NULL,
  `organism` varchar(128) DEFAULT NULL,
  `sample_name` varchar(128) DEFAULT NULL,
  `sample_title` varchar(128) DEFAULT NULL,
  `sra_bio_sample_package` varchar(128) DEFAULT NULL,
  `tissue` varchar(128) DEFAULT NULL,
  `biomaterial_provider` varchar(128) DEFAULT NULL,
  `cell_line` varchar(128) DEFAULT NULL,
  `cell_type` varchar(128) DEFAULT NULL,
  `collected_by` varchar(128) DEFAULT NULL,
  `collection_date` date DEFAULT NULL,
  `culture_collection` varchar(128) DEFAULT NULL,
  `description` varchar(128) DEFAULT NULL,
  `disease` varchar(128) DEFAULT NULL,
  `disease_stage` varchar(128) DEFAULT NULL,
  `genotype` varchar(128) DEFAULT NULL,
  `growth_protocol` varchar(128) DEFAULT NULL,
  `height_or_length` varchar(128) DEFAULT NULL,
  `lat_lon` varchar(128) DEFAULT NULL,
  `phenotype` varchar(128) DEFAULT NULL,
  `population` varchar(128) DEFAULT NULL,
  `sample_type` varchar(128) DEFAULT NULL,
  `sex` varchar(128) DEFAULT NULL,
  `specimen_voucher` varchar(128) DEFAULT NULL,
  `sub_species` varchar(128) DEFAULT NULL,
  `temp` varchar(128) DEFAULT NULL,
  `treatment` varchar(128) DEFAULT NULL,
  `isolation_source` varchar(128) DEFAULT NULL,
  `parent_uuid` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `uuid_2` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bio_sample_data_file`
--

DROP TABLE IF EXISTS `bio_sample_data_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bio_sample_data_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(128) NOT NULL,
  `file_path` varchar(512) NOT NULL,
  `parent_uuid` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `file_path` (`file_path`),
  KEY `uuid_2` (`uuid`),
  KEY `file_path_2` (`file_path`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bio_sample_library`
--

DROP TABLE IF EXISTS `bio_sample_library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bio_sample_library` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(128) NOT NULL,
  `title` varchar(128) DEFAULT NULL,
  `instrument_model` varchar(128) DEFAULT NULL,
  `library_layout` varchar(128) DEFAULT NULL,
  `library_name` varchar(128) DEFAULT NULL,
  `library_selection` varchar(128) DEFAULT NULL,
  `library_source` varchar(128) DEFAULT NULL,
  `library_strategy` varchar(128) DEFAULT NULL,
  `parent_uuid` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `uuid_2` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_id` varchar(40) NOT NULL,
  `system` varchar(40) DEFAULT NULL,
  `path` text,
  `source` varchar(40) DEFAULT NULL,
  `line` varchar(40) DEFAULT NULL,
  `replicate` varchar(40) DEFAULT NULL,
  `description` text,
  `format` varchar(40) NOT NULL,
  `type` varchar(40) NOT NULL,
  `paired_end` int(11) DEFAULT '0',
  `paired_with` varchar(40) DEFAULT NULL,
  `derived_from` varchar(40) DEFAULT NULL,
  `controlled_by` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `file_id` (`file_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `file_view`
--

DROP TABLE IF EXISTS `file_view`;
/*!50001 DROP VIEW IF EXISTS `file_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `file_view` (
 `system` tinyint NOT NULL,
  `path` tinyint NOT NULL,
  `file_type` tinyint NOT NULL,
  `file_format` tinyint NOT NULL,
  `file_description` tinyint NOT NULL,
  `line_name` tinyint NOT NULL,
  `organism_name` tinyint NOT NULL,
  `organism_scientific_name` tinyint NOT NULL,
  `organism_taxon_id` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `job_id` varchar(40) NOT NULL,
  `agave_id` varchar(40) DEFAULT NULL,
  `app_id` varchar(100) NOT NULL,
  `job_json` text,
  `agave_json` text,
  `status` varchar(40) DEFAULT NULL,
  `step_id` int(11) DEFAULT NULL,
  `workflow_id` varchar(40) DEFAULT NULL,
  `username` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `job_id` (`job_id`),
  UNIQUE KEY `agave_id` (`agave_id`),
  KEY `job_id_2` (`job_id`),
  KEY `agave_id_2` (`agave_id`),
  KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5695 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `line`
--

DROP TABLE IF EXISTS `line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `line` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `line_id` varchar(40) NOT NULL,
  `name` varchar(40) NOT NULL,
  `organism` varchar(40) NOT NULL,
  `url` text,
  PRIMARY KEY (`id`),
  KEY `line_id` (`line_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(40) NOT NULL,
  `login_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nextstep`
--

DROP TABLE IF EXISTS `nextstep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nextstep` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prev` varchar(40) DEFAULT NULL,
  `next` varchar(40) DEFAULT NULL,
  `input_name` varchar(100) NOT NULL,
  `input_source` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `prev` (`prev`),
  KEY `next` (`next`)
) ENGINE=InnoDB AUTO_INCREMENT=521 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organism`
--

DROP TABLE IF EXISTS `organism`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organism` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organism_id` varchar(40) NOT NULL,
  `name` varchar(40) NOT NULL,
  `scientific_name` text,
  `taxon_id` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organism_id` (`organism_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(40) NOT NULL,
  `firstName` varchar(40) DEFAULT NULL,
  `lastName` varchar(40) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `username_2` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=457 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_workflow`
--

DROP TABLE IF EXISTS `user_workflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_workflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workflow_id` varchar(40) DEFAULT NULL,
  `username` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workflow_id` (`workflow_id`,`username`),
  KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `user_workflow_view`
--

DROP TABLE IF EXISTS `user_workflow_view`;
/*!50001 DROP VIEW IF EXISTS `user_workflow_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `user_workflow_view` (
 `workflow_id` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `description` tinyint NOT NULL,
  `json` tinyint NOT NULL,
  `username` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `workflow`
--

DROP TABLE IF EXISTS `workflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workflow_id` varchar(40) NOT NULL,
  `name` varchar(40) NOT NULL,
  `description` text,
  `json` text,
  `derived_from` varchar(40) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `workflow_id` (`workflow_id`),
  KEY `workflow_id_2` (`workflow_id`),
  KEY `derived_from` (`derived_from`)
) ENGINE=InnoDB AUTO_INCREMENT=384 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `file_view`
--

/*!50001 DROP TABLE IF EXISTS `file_view`*/;
/*!50001 DROP VIEW IF EXISTS `file_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`sciapps`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `file_view` AS select `file`.`system` AS `system`,`file`.`path` AS `path`,`file`.`type` AS `file_type`,`file`.`format` AS `file_format`,`file`.`description` AS `file_description`,`line`.`name` AS `line_name`,`organism`.`name` AS `organism_name`,`organism`.`scientific_name` AS `organism_scientific_name`,`organism`.`taxon_id` AS `organism_taxon_id` from ((`file` join `line` on((`file`.`line` = `line`.`line_id`))) join `organism` on((`line`.`organism` = `organism`.`organism_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_workflow_view`
--

/*!50001 DROP TABLE IF EXISTS `user_workflow_view`*/;
/*!50001 DROP VIEW IF EXISTS `user_workflow_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`sciapps`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_workflow_view` AS select `workflow`.`workflow_id` AS `workflow_id`,`workflow`.`name` AS `name`,`workflow`.`description` AS `description`,`workflow`.`json` AS `json`,`user_workflow`.`username` AS `username` from (`workflow` join `user_workflow` on((`workflow`.`workflow_id` = `user_workflow`.`workflow_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-09-05 10:55:43
