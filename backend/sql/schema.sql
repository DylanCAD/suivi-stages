-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: suivi_stages
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrateurs`
--

DROP TABLE IF EXISTS `administrateurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrateurs` (
  `id_utilisateur` int unsigned NOT NULL,
  `niveau_acces` tinyint NOT NULL DEFAULT '1',
  `derniere_connexion` datetime DEFAULT NULL,
  `notes_admin` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_utilisateur`),
  CONSTRAINT `fk_admin_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrateurs`
--

LOCK TABLES `administrateurs` WRITE;
/*!40000 ALTER TABLE `administrateurs` DISABLE KEYS */;
INSERT INTO `administrateurs` VALUES (1,2,NULL,NULL),(11,1,NULL,NULL),(13,1,NULL,NULL),(21,1,NULL,NULL);
/*!40000 ALTER TABLE `administrateurs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id_document` int unsigned NOT NULL AUTO_INCREMENT,
  `id_stage` int unsigned NOT NULL,
  `nom_fichier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_document` enum('convention','rapport','attestation','evaluation_form','autre') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'autre',
  `chemin_stockage` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taille_octets` int unsigned DEFAULT NULL,
  `mime_type` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `est_valide` tinyint(1) NOT NULL DEFAULT '1',
  `date_depot` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_document`),
  KEY `idx_doc_stage` (`id_stage`),
  KEY `idx_doc_type` (`id_stage`,`type_document`),
  CONSTRAINT `fk_document_stage` FOREIGN KEY (`id_stage`) REFERENCES `stages` (`id_stage`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,'ae22a9a9-9580-47c9-b2f3-5f514aa34762.pdf','MINISTERE (1).pdf','rapport','C:\\Users\\cadot\\Documents\\suivi-stages\\backend\\src\\uploads\\4\\ae22a9a9-9580-47c9-b2f3-5f514aa34762.pdf',3271264,'application/pdf',1,'2026-04-16 15:00:15'),(2,6,'2cac72c4-94fc-4975-aeea-36cd53fdec64.pdf','Design sans titre (14).pdf','rapport','C:\\Users\\cadot\\Documents\\suivi-stages\\backend\\src\\uploads\\31\\2cac72c4-94fc-4975-aeea-36cd53fdec64.pdf',429635,'application/pdf',1,'2026-05-05 14:54:31'),(3,7,'172494fe-6018-4d82-9dd2-c3097fd652c2.pdf','Design sans titre (13).pdf','rapport','C:\\Users\\cadot\\Documents\\suivi-stages\\backend\\src\\uploads\\31\\172494fe-6018-4d82-9dd2-c3097fd652c2.pdf',447158,'application/pdf',1,'2026-05-05 15:26:01'),(4,10,'a76bc98f-ec7b-44b1-b6ad-1469e8dac5d3.pdf','Design sans titre (13).pdf','rapport','C:\\Users\\cadot\\Documents\\suivi-stages\\backend\\src\\uploads\\31\\a76bc98f-ec7b-44b1-b6ad-1469e8dac5d3.pdf',447158,'application/pdf',1,'2026-05-05 22:15:07'),(12,15,'57fbe585-33d7-4b34-ac10-a568966e364a.pdf','Design sans titre (13).pdf','rapport','C:\\Users\\cadot\\Documents\\suivi-stages\\backend\\src\\uploads\\31\\57fbe585-33d7-4b34-ac10-a568966e364a.pdf',447158,'application/pdf',1,'2026-05-05 23:54:08');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enseignants`
--

DROP TABLE IF EXISTS `enseignants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enseignants` (
  `id_utilisateur` int unsigned NOT NULL,
  `matricule` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departement` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialite` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bureau` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone_pro` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `uq_matricule` (`matricule`),
  CONSTRAINT `fk_enseignant_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enseignants`
--

LOCK TABLES `enseignants` WRITE;
/*!40000 ALTER TABLE `enseignants` DISABLE KEYS */;
INSERT INTO `enseignants` VALUES (2,'ENS-001','Informatique','D├®veloppement Web','B204',NULL),(3,'ENS-002','Informatique','R├®seaux & Syst├¿mes','B210',NULL),(15,NULL,'',NULL,NULL,NULL),(23,NULL,'test 2',NULL,NULL,NULL);
/*!40000 ALTER TABLE `enseignants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entreprises`
--

DROP TABLE IF EXISTS `entreprises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entreprises` (
  `id_entreprise` int unsigned NOT NULL AUTO_INCREMENT,
  `raison_sociale` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `siret` char(14) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secteur_activite` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `ville` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code_postal` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'France',
  `site_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_entreprise`),
  UNIQUE KEY `uq_siret` (`siret`),
  KEY `idx_ville` (`ville`),
  FULLTEXT KEY `ft_entreprise` (`raison_sociale`,`secteur_activite`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entreprises`
--

LOCK TABLES `entreprises` WRITE;
/*!40000 ALTER TABLE `entreprises` DISABLE KEYS */;
INSERT INTO `entreprises` VALUES (1,'Capgemini France SAS','44229342600031','Services num├®riques','10 avenue de la Victoire','Bordeaux','33000','France',NULL,'2026-02-20 11:08:05'),(2,'Orange Business','38012986645100','T├®l├®communications','78 rue Olivier de Serres','Paris','75015','France',NULL,'2026-02-20 11:08:05'),(3,'Sopra Steria','32695946600074','Conseil IT','9 bis rue de Presbourg','Bordeaux','33000','France',NULL,'2026-02-20 11:08:05'),(4,'SNCF','12345678923456','Conseil IT',NULL,'Clayes','78340','France',NULL,'2026-05-05 12:06:01'),(5,'drtfyguhijok',NULL,NULL,NULL,NULL,NULL,'France',NULL,'2026-05-05 14:06:36'),(6,'s',NULL,NULL,NULL,NULL,NULL,'France',NULL,'2026-05-05 16:14:08'),(7,'dddddd',NULL,NULL,NULL,NULL,NULL,'France',NULL,'2026-05-05 23:44:47'),(8,'gythjk',NULL,NULL,NULL,NULL,NULL,'France',NULL,'2026-05-06 12:16:49'),(9,'zzzzzzzzz',NULL,NULL,NULL,NULL,NULL,'France',NULL,'2026-05-06 12:36:30'),(10,'zaaaaaaa',NULL,NULL,NULL,NULL,NULL,'France',NULL,'2026-05-06 12:41:28');
/*!40000 ALTER TABLE `entreprises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etudiants`
--

DROP TABLE IF EXISTS `etudiants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etudiants` (
  `id_utilisateur` int unsigned NOT NULL,
  `id_enseignant_ref` int unsigned DEFAULT NULL,
  `numero_etudiant` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formation` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `annee_promotion` year DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `uq_numero_etudiant` (`numero_etudiant`),
  KEY `idx_formation` (`formation`),
  KEY `idx_enseignant_ref` (`id_enseignant_ref`),
  CONSTRAINT `fk_etudiant_enseignant` FOREIGN KEY (`id_enseignant_ref`) REFERENCES `enseignants` (`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_etudiant_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etudiants`
--

LOCK TABLES `etudiants` WRITE;
/*!40000 ALTER TABLE `etudiants` DISABLE KEYS */;
INSERT INTO `etudiants` VALUES (4,2,'20230421','BTS SIO SLAM',2025,NULL,NULL),(5,2,'20230422','BTS SIO SISR',2025,NULL,NULL),(6,3,'20230423','LP Dev Web',2025,NULL,NULL),(9,2,NULL,'BTS',NULL,NULL,NULL),(12,23,NULL,'BTS',NULL,NULL,NULL),(14,15,NULL,'Master DI',NULL,NULL,NULL),(22,3,NULL,'',NULL,NULL,NULL),(30,15,NULL,'',NULL,NULL,NULL),(31,15,NULL,'BTS',NULL,NULL,NULL);
/*!40000 ALTER TABLE `etudiants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluations`
--

DROP TABLE IF EXISTS `evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluations` (
  `id_evaluation` int unsigned NOT NULL AUTO_INCREMENT,
  `id_stage` int unsigned NOT NULL,
  `id_tuteur` int unsigned DEFAULT NULL,
  `id_enseignant` int unsigned DEFAULT NULL,
  `note_tuteur` decimal(4,2) DEFAULT NULL,
  `note_enseignant` decimal(4,2) DEFAULT NULL,
  `note_finale` decimal(4,2) GENERATED ALWAYS AS (round(((`note_tuteur` * 0.40) + (`note_enseignant` * 0.60)),2)) STORED,
  `commentaire_tuteur` text COLLATE utf8mb4_unicode_ci,
  `commentaire_enseignant` text COLLATE utf8mb4_unicode_ci,
  `criteres_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_evaluation`),
  UNIQUE KEY `uq_stage_eval` (`id_stage`),
  KEY `fk_eval_tuteur` (`id_tuteur`),
  KEY `fk_eval_enseignant` (`id_enseignant`),
  CONSTRAINT `fk_eval_enseignant` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_eval_stage` FOREIGN KEY (`id_stage`) REFERENCES `stages` (`id_stage`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_eval_tuteur` FOREIGN KEY (`id_tuteur`) REFERENCES `tuteurs` (`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_note_enseignant` CHECK ((`note_enseignant` between 0 and 20)),
  CONSTRAINT `chk_note_tuteur` CHECK ((`note_tuteur` between 0 and 20))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluations`
--

LOCK TABLES `evaluations` WRITE;
/*!40000 ALTER TABLE `evaluations` DISABLE KEYS */;
INSERT INTO `evaluations` (`id_evaluation`, `id_stage`, `id_tuteur`, `id_enseignant`, `note_tuteur`, `note_enseignant`, `commentaire_tuteur`, `commentaire_enseignant`, `criteres_json`, `created_at`, `updated_at`) VALUES (1,7,NULL,15,16.00,10.00,NULL,NULL,'{\"autonomie\": 10, \"competences\": 10, \"integration\": 6.5, \"ponctualite\": 12, \"communication\": 15}','2026-05-05 15:27:34','2026-05-05 15:27:58'),(3,10,NULL,15,5.50,17.00,NULL,NULL,'{\"autonomie\": 10, \"competences\": 10, \"integration\": 10, \"ponctualite\": 10, \"communication\": 10}','2026-05-05 22:16:48','2026-05-05 22:17:29'),(5,12,NULL,15,4.50,2.50,NULL,NULL,'{\"autonomie\": 10, \"competences\": 10, \"integration\": 10, \"ponctualite\": 10, \"communication\": 10}','2026-05-05 23:14:25','2026-05-05 23:16:19'),(11,13,NULL,15,3.00,12.50,NULL,NULL,'{\"autonomie\": 10, \"competences\": 10, \"integration\": 10, \"ponctualite\": 10, \"communication\": 10}','2026-05-05 23:18:17','2026-05-05 23:27:00'),(14,15,34,NULL,16.50,14.50,NULL,NULL,'{\"autonomie\": 10, \"competences\": 10, \"integration\": 10, \"ponctualite\": 10, \"communication\": 10}','2026-05-05 23:55:39','2026-05-05 23:56:16'),(16,17,NULL,15,2.50,17.50,NULL,NULL,'{\"autonomie\": 10, \"competences\": 10, \"integration\": 10, \"ponctualite\": 10, \"communication\": 10}','2026-05-06 12:27:05','2026-05-06 12:27:31'),(18,16,34,NULL,15.50,0.00,NULL,NULL,'{\"autonomie\": 10, \"competences\": 10, \"integration\": 10, \"ponctualite\": 10, \"communication\": 10}','2026-05-06 12:28:33','2026-05-06 12:28:43'),(20,18,32,NULL,14.50,3.00,NULL,'bravo','{\"autonomie\": 10, \"competences\": 10, \"integration\": 10, \"ponctualite\": 10, \"communication\": 10}','2026-05-06 12:37:14','2026-05-06 12:37:27'),(22,19,34,NULL,1.50,15.50,NULL,NULL,'{\"autonomie\": 10, \"competences\": 10, \"integration\": 10, \"ponctualite\": 10, \"communication\": 10}','2026-05-06 12:42:24','2026-05-06 12:42:40');
/*!40000 ALTER TABLE `evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id_notification` int unsigned NOT NULL AUTO_INCREMENT,
  `id_destinataire` int unsigned NOT NULL,
  `id_stage` int unsigned DEFAULT NULL,
  `type_notification` enum('validation','refus','document_depose','evaluation_dispo','rappel','info','statut','evalue','evaluation') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `lue` tinyint(1) NOT NULL DEFAULT '0',
  `lien_action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_envoi` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notification`),
  KEY `idx_destinataire` (`id_destinataire`),
  KEY `idx_notif_non_lues` (`id_destinataire`,`lue`),
  KEY `idx_notif_stage` (`id_stage`),
  CONSTRAINT `fk_notif_stage` FOREIGN KEY (`id_stage`) REFERENCES `stages` (`id_stage`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`id_destinataire`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,2,'validation','Un nouveau stage est en attente de votre validation : \"Administrateur Syst├¿mes & R├®seaux\".',0,'/stages/2','2026-02-20 11:08:05'),(2,4,1,'info','Ô£à Votre stage \"D├®veloppeur Full-Stack\" est en cours. Pensez ├á d├®poser votre rapport interm├®diaire.',0,'/stages/1','2026-02-20 11:08:05'),(3,6,3,'validation','Ô£à Votre stage \"D├®veloppeur Mobile iOS\" a ├®t├® valid├® par Mme Martin.',1,'/stages/3','2026-02-20 11:08:05'),(4,2,1,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #1.',0,'/stages/1','2026-04-16 15:00:15'),(5,15,5,'validation','Un nouveau stage est en attente de votre validation.',1,'/stages/5','2026-05-05 14:51:08'),(6,31,5,'refus','ÔØî Votre stage a ├®t├® refus├®. Motif : non',1,'/stages/5','2026-05-05 14:51:49'),(7,15,6,'validation','Un nouveau stage est en attente de votre validation.',1,'/stages/6','2026-05-05 14:53:11'),(8,31,6,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/6','2026-05-05 14:53:38'),(9,15,6,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #6.',1,'/stages/6','2026-05-05 14:54:31'),(10,15,7,'validation','Un nouveau stage est en attente de votre validation.',1,'/stages/7','2026-05-05 15:23:19'),(11,31,7,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/7','2026-05-05 15:24:54'),(12,15,7,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #7.',1,'/stages/7','2026-05-05 15:26:01'),(13,31,7,'evaluation_dispo','Ô¡É Votre stage a ├®t├® ├®valu├® par votre enseignant !',0,'/stages/7','2026-05-05 15:27:34'),(14,15,8,'validation','Un nouveau stage est en attente de votre validation.',1,'/stages/8','2026-05-05 15:51:23'),(15,31,8,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/8','2026-05-05 15:53:45'),(16,15,9,'validation','Un nouveau stage est en attente de votre validation.',1,'/stages/9','2026-05-05 16:12:53'),(17,15,10,'validation','Un nouveau stage est en attente de votre validation.',1,'/stages/10','2026-05-05 16:14:08'),(18,31,10,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/10','2026-05-05 22:11:57'),(19,31,9,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/9','2026-05-05 22:14:17'),(20,15,10,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #10.',0,'/stages/10','2026-05-05 22:15:07'),(21,31,10,'evaluation_dispo','Ô¡É Votre stage a ├®t├® ├®valu├® par votre enseignant !',0,'/stages/10','2026-05-05 22:16:48'),(22,15,11,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/11','2026-05-05 22:19:59'),(23,31,11,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/11','2026-05-05 22:20:36'),(24,15,11,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #11.',0,'/stages/11','2026-05-05 22:21:10'),(25,15,11,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #11.',0,'/stages/11','2026-05-05 22:30:08'),(26,15,11,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #11.',0,'/stages/11','2026-05-05 22:30:31'),(27,15,11,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #11.',0,'/stages/11','2026-05-05 22:30:35'),(28,15,11,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #11.',0,'/stages/11','2026-05-05 22:31:52'),(29,15,11,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #11.',0,'/stages/11','2026-05-05 22:34:52'),(30,15,12,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/12','2026-05-05 22:52:59'),(31,31,12,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/12','2026-05-05 22:53:16'),(32,31,12,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/12','2026-05-05 23:14:25'),(33,31,12,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/12','2026-05-05 23:16:03'),(34,31,12,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/12','2026-05-05 23:16:07'),(35,31,12,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/12','2026-05-05 23:16:19'),(36,15,13,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/13','2026-05-05 23:17:12'),(37,31,13,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/13','2026-05-05 23:17:41'),(38,31,13,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/13','2026-05-05 23:18:17'),(39,31,13,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/13','2026-05-05 23:27:00'),(40,15,14,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/14','2026-05-05 23:34:12'),(41,15,15,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/15','2026-05-05 23:44:47'),(42,31,15,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/15','2026-05-05 23:53:27'),(43,15,15,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #15.',0,'/stages/15','2026-05-05 23:54:01'),(44,15,15,'document_depose','Un nouveau document a ├®t├® d├®pos├® pour le stage #15.',0,'/stages/15','2026-05-05 23:54:08'),(45,31,15,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/15','2026-05-05 23:56:16'),(46,31,14,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/14','2026-05-06 00:03:54'),(47,15,16,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/16','2026-05-06 00:35:29'),(48,15,17,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/17','2026-05-06 12:16:49'),(49,31,17,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/17','2026-05-06 12:17:10'),(50,31,17,'statut','­ƒÅü Votre stage est termin├®. L\'├®valuation va bient├┤t d├®buter.',0,'/stages/17','2026-05-06 12:26:52'),(51,31,17,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/17','2026-05-06 12:27:05'),(52,31,16,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/16','2026-05-06 12:28:03'),(53,31,16,'statut','­ƒÜÇ Votre stage a d├®marr├® ! Vous pouvez maintenant d├®poser vos documents.',0,'/stages/16','2026-05-06 12:28:09'),(54,34,16,'statut','­ƒÜÇ Un stage que vous suivez vient de d├®marrer.',0,'/stages/16','2026-05-06 12:28:09'),(55,31,16,'statut','­ƒÅü Votre stage est termin├®. L\'├®valuation va bient├┤t d├®buter.',0,'/stages/16','2026-05-06 12:28:16'),(56,31,16,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/16','2026-05-06 12:28:43'),(57,15,18,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/18','2026-05-06 12:36:30'),(58,31,18,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/18','2026-05-06 12:36:46'),(59,31,18,'statut','­ƒÜÇ Votre stage a d├®marr├® ! Vous pouvez maintenant d├®poser vos documents.',0,'/stages/18','2026-05-06 12:36:52'),(60,32,18,'statut','­ƒÜÇ Un stage que vous suivez vient de d├®marrer.',0,'/stages/18','2026-05-06 12:36:52'),(61,31,18,'statut','­ƒÅü Votre stage est termin├®. L\'├®valuation va bient├┤t d├®buter.',0,'/stages/18','2026-05-06 12:36:58'),(62,31,18,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/18','2026-05-06 12:37:27'),(63,15,19,'validation','Un nouveau stage est en attente de votre validation.',0,'/stages/19','2026-05-06 12:41:28'),(64,31,19,'validation','Ô£à Votre stage a ├®t├® valid├® !',0,'/stages/19','2026-05-06 12:41:44'),(65,31,19,'statut','­ƒÜÇ Votre stage a d├®marr├® ! Vous pouvez maintenant d├®poser vos documents.',0,'/stages/19','2026-05-06 12:41:48'),(66,34,19,'statut','­ƒÜÇ Un stage que vous suivez vient de d├®marrer.',0,'/stages/19','2026-05-06 12:41:48'),(67,31,19,'statut','­ƒÅü Votre stage est termin├®. L\'├®valuation va bient├┤t d├®buter.',0,'/stages/19','2026-05-06 12:42:09'),(68,31,19,'evaluation_dispo','Ô¡É Votre enseignant a soumis son ├®valuation.',0,'/stages/19','2026-05-06 12:42:40'),(69,31,19,'evaluation','­ƒÄô Votre stage a ├®t├® ├®valu├®. Note finale : 9.90/20',0,'/stages/19','2026-05-06 12:42:40');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stages`
--

DROP TABLE IF EXISTS `stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stages` (
  `id_stage` int unsigned NOT NULL AUTO_INCREMENT,
  `id_etudiant` int unsigned NOT NULL,
  `id_enseignant` int unsigned DEFAULT NULL,
  `id_tuteur` int unsigned DEFAULT NULL,
  `id_entreprise` int unsigned DEFAULT NULL,
  `titre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `missions` text COLLATE utf8mb4_unicode_ci,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `statut` enum('en_attente','valide','refuse','en_cours','termine','evalue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `motif_refus` text COLLATE utf8mb4_unicode_ci,
  `archive` tinyint(1) NOT NULL DEFAULT '0',
  `annee_scolaire` varchar(9) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_stage`),
  KEY `idx_etudiant` (`id_etudiant`),
  KEY `idx_enseignant` (`id_enseignant`),
  KEY `idx_tuteur` (`id_tuteur`),
  KEY `idx_entreprise` (`id_entreprise`),
  KEY `idx_statut` (`statut`),
  KEY `idx_archive` (`archive`),
  KEY `idx_annee` (`annee_scolaire`),
  KEY `idx_dates` (`date_debut`,`date_fin`),
  CONSTRAINT `fk_stage_enseignant` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_stage_entreprise` FOREIGN KEY (`id_entreprise`) REFERENCES `entreprises` (`id_entreprise`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_stage_etudiant` FOREIGN KEY (`id_etudiant`) REFERENCES `etudiants` (`id_utilisateur`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_stage_tuteur` FOREIGN KEY (`id_tuteur`) REFERENCES `tuteurs` (`id_utilisateur`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_dates` CHECK ((`date_fin` > `date_debut`))
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stages`
--

LOCK TABLES `stages` WRITE;
/*!40000 ALTER TABLE `stages` DISABLE KEYS */;
INSERT INTO `stages` VALUES (1,4,2,7,1,'D├®veloppeur Full-Stack','Int├®gration dans l\'├®quipe de d├®veloppement pour cr├®er une application web de gestion interne.','D├®veloppement React, API REST Node.js, tests unitaires, revue de code.','2025-04-01','2025-06-30','en_cours',NULL,0,'2024-2025','2026-02-20 11:08:05','2026-02-20 11:08:05'),(2,5,2,NULL,NULL,'Administrateur Syst├¿mes & R├®seaux','Stage en administration syst├¿me dans une infrastructure cloud.','Configuration serveurs Linux, monitoring, d├®ploiement Docker.','2025-04-07','2025-07-04','en_attente',NULL,0,'2024-2025','2026-02-20 11:08:05','2026-02-20 11:08:05'),(3,6,3,8,2,'D├®veloppeur Mobile iOS','Cr├®ation d\'une application mobile pour Orange Business.','Swift, UIKit, int├®gration API, publication App Store.','2025-03-01','2025-08-31','valide',NULL,0,'2024-2025','2026-02-20 11:08:05','2026-02-20 11:08:05'),(4,14,NULL,NULL,4,'Stage 1 Zidane','Stage 1 Zidane description','Stage 1 Zidane missions','2026-05-05','2026-05-19','en_attente',NULL,0,'2025-2026','2026-05-05 12:06:01','2026-05-05 12:06:01'),(5,31,15,NULL,4,'ccccccccc',NULL,NULL,'2026-05-07','2026-05-13','refuse','non',0,'2025-2026','2026-05-05 14:51:08','2026-05-05 14:51:49'),(6,31,15,8,4,'ddddddddz',NULL,NULL,'2026-05-02','2026-05-03','valide',NULL,0,'2025-2026','2026-05-05 14:53:11','2026-05-05 15:50:42'),(7,31,15,28,4,'stgaaeee',NULL,NULL,'2026-05-12','2026-05-16','valide',NULL,0,'2025-2026','2026-05-05 15:23:19','2026-05-05 15:24:54'),(8,31,15,NULL,4,'yyyyyyyyyy',NULL,NULL,'2026-04-27','2026-05-01','valide',NULL,0,'2025-2026','2026-05-05 15:51:23','2026-05-05 15:53:45'),(9,31,15,32,4,'u',NULL,NULL,'2026-05-07','2026-05-14','en_cours',NULL,0,'2025-2026','2026-05-05 16:12:52','2026-05-05 22:14:24'),(10,31,15,32,6,'d',NULL,NULL,'2026-05-01','2026-05-31','termine',NULL,0,'2025-2026','2026-05-05 16:14:08','2026-05-05 22:16:21'),(11,31,15,33,4,'dddddddddde',NULL,NULL,'2026-04-30','2026-06-05','termine',NULL,0,'2025-2026','2026-05-05 22:19:59','2026-05-05 22:49:25'),(12,31,15,34,4,'ddddddd',NULL,NULL,'2026-05-14','2026-05-22','termine',NULL,0,'2025-2026','2026-05-05 22:52:59','2026-05-05 23:03:18'),(13,31,15,33,4,'hngbfdvcsqx',NULL,NULL,'2026-05-20','2026-06-04','evalue',NULL,0,'2025-2026','2026-05-05 23:17:12','2026-05-05 23:27:00'),(14,31,15,33,4,'dee',NULL,NULL,'2026-05-13','2026-05-30','termine',NULL,0,'2025-2026','2026-05-05 23:34:12','2026-05-06 00:04:17'),(15,31,15,34,7,'dddddddddd',NULL,NULL,'2026-05-05','2026-05-29','evalue',NULL,0,'2025-2026','2026-05-05 23:44:47','2026-05-05 23:56:16'),(16,31,15,34,4,'eeeeee',NULL,NULL,'2026-05-02','2026-05-19','evalue',NULL,0,'2025-2026','2026-05-06 00:35:28','2026-05-06 12:28:43'),(17,31,15,34,8,'hhh',NULL,NULL,'2026-05-05','2026-05-28','evalue',NULL,0,'2025-2026','2026-05-06 12:16:49','2026-05-06 12:27:31'),(18,31,15,32,9,'zzzzzzzzz',NULL,NULL,'2026-05-04','2026-05-29','evalue',NULL,0,'2025-2026','2026-05-06 12:36:30','2026-05-06 12:37:27'),(19,31,15,34,10,'zzzzzzzzzzz',NULL,NULL,'2026-05-07','2026-06-04','evalue',NULL,0,'2025-2026','2026-05-06 12:41:28','2026-05-06 12:42:40');
/*!40000 ALTER TABLE `stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tuteurs`
--

DROP TABLE IF EXISTS `tuteurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tuteurs` (
  `id_utilisateur` int unsigned NOT NULL,
  `id_entreprise` int unsigned NOT NULL,
  `poste` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_evaluation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `uq_token_eval` (`token_evaluation`),
  KEY `idx_entreprise` (`id_entreprise`),
  CONSTRAINT `fk_tuteur_entreprise` FOREIGN KEY (`id_entreprise`) REFERENCES `entreprises` (`id_entreprise`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tuteur_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tuteurs`
--

LOCK TABLES `tuteurs` WRITE;
/*!40000 ALTER TABLE `tuteurs` DISABLE KEYS */;
INSERT INTO `tuteurs` VALUES (7,1,'Chef de projet','0556123456',NULL,NULL),(8,2,'Responsable technique','0156789012','4f797ccc-5c53-49fc-b491-ece7b47b3682','2026-04-30 15:59:09'),(28,1,'Responsable DI',NULL,NULL,NULL),(29,5,'',NULL,NULL,NULL),(32,9,'',NULL,NULL,NULL),(33,4,'',NULL,NULL,NULL),(34,10,'',NULL,NULL,NULL);
/*!40000 ALTER TABLE `tuteurs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utilisateurs` (
  `id_utilisateur` int unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('etudiant','enseignant','tuteur','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `refresh_token` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `otp_code` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_actif` (`actif`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table commune ├á tous les acteurs du syst├¿me';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utilisateurs`
--

LOCK TABLES `utilisateurs` WRITE;
/*!40000 ALTER TABLE `utilisateurs` DISABLE KEYS */;
INSERT INTO `utilisateurs` VALUES (1,'Admin','Syst├¿me','admin@suivi-stages.fr','$2b$12$LIRxLzy0v6ird83Xvoh3cuUh1/kADlTaUbVfWEETAqqlScfhZJkYq','admin',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzc4NTc4MTg3LCJleHAiOjE3NzkxODI5ODd9.iSFuZL2ZWBqCXvEU0RhIXY2qTFTPuXOEDQyZcjhhuBw','2026-05-19 10:29:47','2026-02-20 11:08:05','2026-05-12 11:29:47',NULL,NULL,'948049','2026-05-12 10:39:01'),(2,'Perrin','Jean','j.perrin@suivi-stages.fr','$2b$12$LIRxLzy0v6ird83Xvoh3cuUh1/kADlTaUbVfWEETAqqlScfhZJkYq','enseignant',1,NULL,NULL,'2026-02-20 11:08:05','2026-04-16 15:01:46',NULL,NULL,NULL,NULL),(3,'Martin','Sophie','s.martin@suivi-stages.fr','$2b$12$LIRxLzy0v6ird83Xvoh3cuUh1/kADlTaUbVfWEETAqqlScfhZJkYq','enseignant',1,NULL,NULL,'2026-02-20 11:08:05','2026-02-20 15:11:52',NULL,NULL,NULL,NULL),(4,'Dupont','Marie','marie.dupont@etudiant.fr','$2b$12$LIRxLzy0v6ird83Xvoh3cuUh1/kADlTaUbVfWEETAqqlScfhZJkYq','etudiant',1,NULL,NULL,'2026-02-20 11:08:05','2026-04-16 15:00:55',NULL,NULL,NULL,NULL),(5,'Bernard','Lucas','lucas.bernard@etudiant.fr','$2b$12$LIRxLzy0v6ird83Xvoh3cuUh1/kADlTaUbVfWEETAqqlScfhZJkYq','etudiant',1,NULL,NULL,'2026-02-20 11:08:05','2026-02-20 15:11:52',NULL,NULL,NULL,NULL),(6,'Leroy','Emma','emma.leroy@etudiant.fr','$2b$12$LIRxLzy0v6ird83Xvoh3cuUh1/kADlTaUbVfWEETAqqlScfhZJkYq','etudiant',1,NULL,NULL,'2026-02-20 11:08:05','2026-02-20 15:11:52',NULL,NULL,NULL,NULL),(7,'Moreau','Paul','p.moreau@capgemini.com','$2b$12$LIRxLzy0v6ird83Xvoh3cuUh1/kADlTaUbVfWEETAqqlScfhZJkYq','tuteur',1,NULL,NULL,'2026-02-20 11:08:05','2026-04-16 15:01:19',NULL,NULL,NULL,NULL),(8,'Girard','Claire','c.girard@orange.com','$2b$12$LIRxLzy0v6ird83Xvoh3cuUh1/kADlTaUbVfWEETAqqlScfhZJkYq','tuteur',1,NULL,NULL,'2026-02-20 11:08:05','2026-02-20 15:11:52',NULL,NULL,NULL,NULL),(9,'dddddddddd','ddddddd','adminssss@suivi-stages.fr','$2b$12$CmvZ3cyOKhPgYG0KW10l/OZqroCCc/hQaFwZq/ssqrlIiju4aSr6G','etudiant',0,NULL,NULL,'2026-04-16 16:36:01','2026-04-16 16:36:16',NULL,NULL,NULL,NULL),(11,'Ensitech','StageTrack','stagetrackensitech@gmail.com','$2b$12$lxgEL2X5st4g7NS17Ka6Te8V5Qr9zipJGjmU6.tQOSSTd.TRhTb/C','admin',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI6MTc3ODY1ODM4MCwiZXhwIjoxNzc5MjYzMTgwfQ.9jna56iitHPtjCbzzWt6dqwnhyhb3qKyk8iSWG5ccsU','2026-05-20 07:46:20','2026-04-21 14:47:55','2026-05-13 09:46:20','7e17ae5213e2c085a34f66f1dc332f432bbe4cba95908e9bd59ca3565eb24191','2026-04-21 14:48:40',NULL,NULL),(12,'Cadot','Dylan','dylan@suivi-stages.fr','$2b$12$9NRqNZJwrzeCll12Hm/vsuPrfKL8ja4Ovyy2iPLGTIGT2msHqlPVa','etudiant',0,NULL,NULL,'2026-04-22 10:21:08','2026-04-22 10:21:25',NULL,NULL,NULL,NULL),(13,'Titi','Jose','adminff@suivi-stages.fr','$2b$12$KyabSgJwZAGU3stgfqvVzOTDJgmjMMVAvYA8z3K6.aOsrERHwHeia','admin',0,NULL,NULL,'2026-04-23 13:35:07','2026-04-23 13:35:25',NULL,NULL,NULL,NULL),(14,'Zidane','Zinedine','zidane@suivi-stages.fr','$2b$12$w2ESc2zdwj/S.vh1XnksnuOrOFyoFypdWVfqsDXGC8wpXL8Glwt9O','etudiant',1,NULL,NULL,'2026-05-05 12:02:57','2026-05-13 09:45:27',NULL,NULL,NULL,NULL),(15,'Riner','Teddy','riner@suivi-stages.fr','$2b$12$6cHXwfzv9PI3WxHCKH7KuuvNDQprxG3mdR5pIFHUykcv/Lv8dY/Uq','enseignant',1,NULL,NULL,'2026-05-05 12:10:30','2026-05-13 09:46:00',NULL,NULL,NULL,NULL),(21,'Bolt','Usain','usain@suivi-stages.fr','$2b$12$fHTzXW0B54KvUblhd2kr/uyhu8hDlb8aNNNKQpfnNHEawbUb1f/9y','admin',1,NULL,NULL,'2026-05-05 12:58:31','2026-05-12 11:20:23',NULL,NULL,'528781','2026-05-12 10:30:24'),(22,'test 1','test 1','usaintest1@suivi-stages.fr','$2b$12$2Ix6Oqlw1YQS2MpHhiannes8K.BbLV0qFZdF5JGCFcz6Dk/6IfVIS','etudiant',0,NULL,NULL,'2026-05-05 13:18:03','2026-05-05 13:18:10',NULL,NULL,NULL,NULL),(23,'test 2','test 2','usaintest2@suivi-stages.fr','$2b$12$jef5IM9SVhsY/4DS81wIk.JZWHsoIpgDTk5oD.3/ERjYkwrTmzFxi','enseignant',0,NULL,NULL,'2026-05-05 13:18:44','2026-05-05 13:18:48',NULL,NULL,NULL,NULL),(28,'Oliveira','Charles','oliveira@suivi-stages.fr','$2b$12$5t77z3OjDIp/UUn6CZYqFOcRlR1JISprRGl4QCF/38nYIXavA0dDe','tuteur',1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImlhdCI6MTc3ODY1ODI2NCwiZXhwIjoxNzc5MjYzMDY0fQ.rMs0nxvqQoksuOwhciJZXHWahKfJASAERuGlwJo87Tc','2026-05-20 07:44:24','2026-05-05 14:05:55','2026-05-13 09:44:24',NULL,NULL,NULL,NULL),(29,'ferzdsaq','fghbj','zfedasss@frzdes.com','$2b$12$pNHD.bblqGRLYSyZOMAtdeQwzDUXEmT1sR0shylaNb8fu3T0FLZ5W','tuteur',0,NULL,NULL,'2026-05-05 14:06:36','2026-05-05 14:06:44',NULL,NULL,NULL,NULL),(30,'jkkkkkkk','ssssss','rfghjk@gmail.coo','$2b$12$zQsA1J1FTr2EcGAlT0ZUmet8NMdZPV8Rc4rKKPkUomccAKJTqhiry','etudiant',0,NULL,NULL,'2026-05-05 14:07:22','2026-05-05 14:07:25',NULL,NULL,NULL,NULL),(31,'cccccc','dddddd','adminccccc@suivi-stages.fr','$2b$12$AOH4KCxUWkjhacVhl/u.cONgHcL3l1RWT2hji1N34wSI87x.qELFm','etudiant',1,NULL,NULL,'2026-05-05 14:50:31','2026-05-13 09:45:49',NULL,NULL,NULL,NULL),(32,'zzzzzzzz','zzzzzzzzzz','ddo@gmail.com','','tuteur',1,NULL,NULL,'2026-05-05 16:12:52','2026-05-06 12:36:30',NULL,NULL,NULL,NULL),(33,'dee','deeee','eeeeeeee@gmail.com','','tuteur',1,NULL,NULL,'2026-05-05 22:19:59','2026-05-05 23:34:12',NULL,NULL,NULL,NULL),(34,'zaaa','zaaaa','dddddd@ffff.com','','tuteur',1,NULL,NULL,'2026-05-05 22:52:59','2026-05-06 12:41:28',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `utilisateurs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 12:31:11
