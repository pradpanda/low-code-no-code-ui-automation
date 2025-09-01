-- Add execution history table
CREATE TABLE IF NOT EXISTS `test_execution_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `test_case_id` int(11) NOT NULL,
  `status` enum('passed','failed','running','cancelled') NOT NULL DEFAULT 'running',
  `exit_code` int(11) DEFAULT NULL,
  `stdout` longtext,
  `stderr` longtext,
  `executed_at` datetime NOT NULL,
  `duration` int(11) DEFAULT NULL COMMENT 'Duration in milliseconds',
  `browser` varchar(50) DEFAULT 'chrome',
  `headed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_test_case_id` (`test_case_id`),
  KEY `idx_executed_at` (`executed_at`),
  CONSTRAINT `fk_execution_history_test_case` FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
