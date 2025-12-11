-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 10, 2025 at 04:33 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db-pipsdiary`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `type` enum('first_trade','first_profit','weekly_consistency','monthly_consistency','profit_milestone','trade_milestone') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `achievedAt` datetime NOT NULL,
  `metadata` json DEFAULT (json_object()),
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `userId`, `type`, `title`, `description`, `achievedAt`, `metadata`, `createdAt`, `updatedAt`) VALUES
(1, 7, 'first_trade', 'First Trade!', 'Completed your first trade in the journal', '2025-11-25 03:56:24', '{}', '2025-11-25 03:56:24', '2025-11-25 03:56:24'),
(2, 7, 'first_profit', 'First Profit!', 'Made your first profitable trade', '2025-11-25 03:56:24', '{}', '2025-11-25 03:56:24', '2025-11-25 03:56:24');

-- --------------------------------------------------------

--
-- Table structure for table `badges`
--

CREATE TABLE `badges` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('consistency','profit','milestone','achievement','special') NOT NULL,
  `icon` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT '#8b5cf6',
  `requirement` json NOT NULL,
  `rarity` enum('common','rare','epic','legendary') DEFAULT 'common',
  `xpReward` int DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `role_name` enum('super_admin','admin','premium_user','user','viewer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'super_admin'),
(2, 'admin'),
(3, 'premium_user'),
(4, 'user'),
(5, 'viewer');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `sid` varchar(36) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`sid`, `expires`, `data`, `createdAt`, `updatedAt`) VALUES
('KCSA9I-F_tyg7z_s1aNNAoMvpv1hRB_L', '2025-12-11 02:44:08', '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"secure\":false,\"httpOnly\":true,\"path\":\"/\"}}', '2025-12-10 02:44:08', '2025-12-10 02:44:08'),
('p8RdvWJ1Bei6smJ7-lGKj_2bAH_aC0pe', '2025-12-11 02:51:57', '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"userId\":7,\"role\":\"user\"}', '2025-12-10 02:44:08', '2025-12-10 02:51:57');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `userId` int NOT NULL,
  `plan` enum('free','pro','lifetime') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'free',
  `expiresAt` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `paymentMethod` varchar(255) DEFAULT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `userId`, `plan`, `expiresAt`, `isActive`, `paymentMethod`, `transactionId`, `created_at`, `updated_at`) VALUES
(5, 7, 'free', NULL, 1, NULL, NULL, '2025-11-10 07:54:49', '2025-11-10 07:54:49'),
(12, 14, 'free', NULL, 1, NULL, NULL, '2025-11-19 08:20:03', '2025-11-19 08:20:03'),
(13, 15, 'free', NULL, 1, NULL, NULL, '2025-11-25 00:16:06', '2025-11-25 00:16:06');

-- --------------------------------------------------------

--
-- Table structure for table `targets`
--

CREATE TABLE `targets` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `enabled` tinyint(1) DEFAULT '0',
  `targetBalance` decimal(15,2) DEFAULT NULL,
  `targetDate` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `startDate` date DEFAULT (curdate()),
  `useDailyTarget` tinyint(1) NOT NULL DEFAULT '0',
  `dailyTargetPercentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `dailyTargetAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `targets`
--

INSERT INTO `targets` (`id`, `userId`, `enabled`, `targetBalance`, `targetDate`, `description`, `startDate`, `useDailyTarget`, `dailyTargetPercentage`, `dailyTargetAmount`, `created_at`, `updated_at`) VALUES
(6, 7, 1, '1000.00', '2025-12-31', '', '2025-11-18', 0, '0.00', '0.00', '2025-11-21 11:05:45', '2025-11-24 08:01:05'),
(13, 14, 0, NULL, NULL, NULL, '2025-11-19', 0, '0.00', '0.00', '2025-11-21 11:05:45', '2025-11-21 11:05:45'),
(14, 15, 0, NULL, NULL, NULL, '2025-11-25', 0, '0.00', '0.00', '2025-11-25 00:16:06', '2025-11-25 00:16:06');

-- --------------------------------------------------------

--
-- Table structure for table `trades`
--

CREATE TABLE `trades` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `date` date NOT NULL,
  `instrument` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Buy','Sell') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lot` decimal(10,2) NOT NULL,
  `entry` decimal(15,5) NOT NULL,
  `stop` decimal(15,5) DEFAULT NULL,
  `take` decimal(15,5) DEFAULT NULL,
  `exit` decimal(15,5) DEFAULT NULL,
  `pips` int DEFAULT '0',
  `profit` decimal(15,2) DEFAULT '0.00',
  `balanceAfter` decimal(15,2) NOT NULL,
  `result` enum('Win','Lose','Break Even') COLLATE utf8mb4_unicode_ci NOT NULL,
  `riskReward` decimal(5,2) DEFAULT '0.00',
  `strategy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `market` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emotionBefore` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emotionAfter` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `screenshot` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trades`
--

INSERT INTO `trades` (`id`, `userId`, `date`, `instrument`, `type`, `lot`, `entry`, `stop`, `take`, `exit`, `pips`, `profit`, `balanceAfter`, `result`, `riskReward`, `strategy`, `market`, `emotionBefore`, `emotionAfter`, `screenshot`, `notes`, `created_at`, `updated_at`) VALUES
(26, 7, '2025-11-25', 'XAUUSD', 'Buy', '0.01', '4000.00000', '3090.00000', '4020.00000', '4020.00000', 40, '20.00', '584.38', 'Win', '0.02', 'SnR', 'Bullish', '', '', '', 'Mantap jiwa', '2025-11-25 03:56:24', '2025-11-25 03:56:24'),
(27, 7, '2025-11-27', 'BTCUSD', 'Buy', '0.10', '4012.00000', '4000.00000', '4050.00000', '4050.00000', 40, '39.00', '623.38', 'Win', '3.17', 'SnD', 'Bullish', '', '', '', 'Keren bang', '2025-11-27 06:18:48', '2025-11-27 06:18:48');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initialBalance` decimal(15,2) DEFAULT '0.00',
  `currentBalance` decimal(15,2) DEFAULT '0.00',
  `currency` enum('USD','IDR','CENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `role_id` int NOT NULL,
  `status` enum('active','suspended','inactive','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `last_login` datetime DEFAULT NULL COMMENT 'Timestamp login terakhir',
  `resetOtp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetOtpExpires` datetime DEFAULT NULL,
  `emailVerificationToken` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailVerificationExpires` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone_number`, `password`, `initialBalance`, `currentBalance`, `currency`, `role_id`, `status`, `last_login`, `resetOtp`, `resetOtpExpires`, `emailVerificationToken`, `emailVerificationExpires`, `created_at`, `updated_at`) VALUES
(7, 'Oswald Tan', 'oswaldpongayow@gmail.com', '0821549026918', '$2b$10$GZY06xmA/sGcEFkGkZ9ewerMUXT4jnAQQvGq94o0tVR6RRMRyPVz6', '564.38', '623.38', 'CENT', 4, 'active', '2025-12-10 02:51:49', NULL, NULL, '', NULL, '2025-11-10 07:54:49', '2025-12-10 02:51:49'),
(14, 'Oswald Tan', 'oswaldtanlee444@gmail.com', NULL, '$2b$10$cYFRV4GJkefh2p8WLosQ9eUAW5Uw1XtTZlVRXMskbPwk8Hwz70PlK', '0.00', '0.00', 'IDR', 4, 'active', '2025-11-19 08:38:28', NULL, NULL, NULL, NULL, '2025-11-19 08:20:03', '2025-11-19 08:38:28'),
(15, 'Tanlee', 'oswaldtanwork@gmail.com', NULL, '$2b$10$D.7KRO6wmF.BU4ccmgPUMuAaid8BpVWSyf9wFEF2PPTDVSQzoZYBG', '0.00', '0.00', 'USD', 4, 'active', '2025-11-25 01:39:07', NULL, NULL, NULL, NULL, '2025-11-25 00:16:06', '2025-11-25 01:39:07');

-- --------------------------------------------------------

--
-- Table structure for table `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `badgeId` int NOT NULL,
  `progress` int DEFAULT '0',
  `achievedAt` datetime DEFAULT NULL,
  `metadata` json DEFAULT (json_object()),
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_levels`
--

CREATE TABLE `user_levels` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `level` int DEFAULT '1',
  `experience` int DEFAULT '0',
  `totalExperience` int DEFAULT '0',
  `dailyStreak` int DEFAULT '0',
  `lastActiveDate` date DEFAULT NULL,
  `profitStreak` int DEFAULT '0',
  `lastProfitDate` date DEFAULT NULL,
  `totalTrades` int DEFAULT '0',
  `consecutiveWins` int DEFAULT '0',
  `maxConsecutiveWins` int DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_levels`
--

INSERT INTO `user_levels` (`id`, `userId`, `level`, `experience`, `totalExperience`, `dailyStreak`, `lastActiveDate`, `profitStreak`, `lastProfitDate`, `totalTrades`, `consecutiveWins`, `maxConsecutiveWins`, `createdAt`, `updatedAt`) VALUES
(1, 7, 2, 50, 150, 1, '2025-11-27', 1, '2025-11-27', 2, 2, 2, '2025-11-25 03:56:24', '2025-11-27 06:18:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_type` (`userId`,`type`);

--
-- Indexes for table `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sid`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `targets`
--
ALTER TABLE `targets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `trades`
--
ALTER TABLE `trades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_date` (`userId`,`date`),
  ADD KEY `idx_user_instrument` (`userId`,`instrument`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_roles` (`role_id`);

--
-- Indexes for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_badge` (`userId`,`badgeId`),
  ADD KEY `badgeId` (`badgeId`);

--
-- Indexes for table `user_levels`
--
ALTER TABLE `user_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `targets`
--
ALTER TABLE `targets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `trades`
--
ALTER TABLE `trades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_levels`
--
ALTER TABLE `user_levels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_user_subscription` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `targets`
--
ALTER TABLE `targets`
  ADD CONSTRAINT `fk_targets_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trades`
--
ALTER TABLE `trades`
  ADD CONSTRAINT `fk_trades_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badgeId`) REFERENCES `badges` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_levels`
--
ALTER TABLE `user_levels`
  ADD CONSTRAINT `user_levels_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
