import "dotenv/config";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { WebSocketServer } from "ws";
import {
  envSchema,
  QueriesStructure,
} from "./types";
import { PoolOptions } from "mysql2/promise";

/** Inicjalizacja loggera
 *  Logi są złożone z:
 *  - Czasu stworzenia loga;
 *  - Dane;
 *  Logi są przekazywane do:
 *  - Konsoli;
 *  - Pliku serwer-*dzisiejsza data*.log
 *
 * */
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: "logs/serwer-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
      ),
      options: { flags: "a" },
    }),
  ],
});

/** Inicjalizacja serwera WebSocketServer
 * Port: 8080
 * */
export const wss: WebSocketServer = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      level: 3,
      memLevel: 7,
    },
    zlibInflateOptions: { chunkSize: 10240 },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024,
  },
});

/**
 * Dopasowanie pliku .env do typu envSchema
 * */
export const env = envSchema.parse(process.env);

/** Konfiguracja połączenia z bazą danych
 * Przekazanie wszystkich wartości z pliku .env
 * Dodatkowo:
 * - Kwerendy można wykonywać z placeholderami;
 * - Maksymalna ilość prób połączenia: 100;
 * - Maksymalna liczba żądań połączenia, które komunikacja z bazą danych umieści w kolejce przed zwróceniem błędu: 100;
 * */
export const dbConfig: PoolOptions = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  namedPlaceholders: true,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 100,
};

/**
 * Statyczne kwerendy podzielone:
 * - sektory;
 * - tabele lub typy danych, na których się pracuje;
 * - operacje na danych;
 * */
export const Queries: QueriesStructure = {
  quiz: {
    get: `SELECT * FROM Quizzes where quiz_id = :quiz_id`,
    getWithCategory: `SELECT q.quiz_id, q.title, c.name AS category, c.category_id, q.cover_url, q.difficulty FROM Quizzes q JOIN Categories c ON q.category_id = c.category_id;`,
    searchWithTitle: `SELECT * FROM Quizzes WHERE title LIKE CONCAT('%', :title, '%');`,
    getTopThree: `SELECT u.username, s.score, s.max_possible_score, s.completed_at FROM UserScores s JOIN Users u ON s.user_id = u.user_id WHERE s.quiz_id = :quiz_id ORDER BY s.score DESC LIMIT 3;`,
    getAvgScore: `SELECT q.title, ROUND(AVG(s.score / s.max_possible_score * 100), 2) AS avg_percent FROM UserScores s JOIN Quizzes q ON s.quiz_id = q.quiz_id GROUP BY s.quiz_id;`,
    getNumberOfDistinctAttempts: `SELECT q.title, COUNT(DISTINCT s.user_id) AS users_attempted FROM UserScores s JOIN Quizzes q ON s.quiz_id = q.quiz_id GROUP BY s.quiz_id;`,
    getFullInfo: `SELECT q.question_id, q.question_text, q.question_type, q.hint, a.answer_id, a.answer_text, a.is_correct FROM Questions q LEFT JOIN Answers a ON q.question_id = a.question_id WHERE q.quiz_id = :quiz_id ORDER BY q.question_order;`,
    delete: `DELETE FROM Quizzes WHERE quiz_id = :quiz_id;`,
    update: `UPDATE Quizzes SET title = :title, description = :description, score = :score, cover_url = :cover_url, category_id = :category_id, author_id = :author_id, created_at = :created_at, time_limit = :time_limit, difficulty = :difficulty, is_public = :is_public WHERE quiz_id = :quiz_id;`,
    add: `INSERT INTO Quizzes (title, description, score, cover_url, category_id, author_id, created_at, time_limit, difficulty, is_public) values (:title, :description, :score, :cover_url, :category_id, :author_id, :created_at, :time_limit, :difficulty, :is_public);`
  },
  category: {
    get: `SELECT * FROM Categories`,
    countOfQuizzes: `SELECT c.category_id, c.name AS category, COUNT(*) AS quiz_count FROM Quizzes q JOIN Categories c ON q.category_id = c.category_id GROUP BY c.category_id`,
    delete: `DELETE FROM Categories WHERE category_id = :category_id`,
    update: `UPDATE Categories SET name = :name, description = :description WHERE category_id = :category_id;`,
    add: `INSERT INTO Categories (name, description) VALUES (:name, :description);`
  },
  answer: {
    get: `SELECT * FROM Answers`,
    getForQuizId: `SELECT answer_text, is_correct FROM Answers WHERE question_id = :question_id;`,
    delete: `DELETE FROM Answers WHERE answer_id = :answer_id;`,
    update: `UPDATE Answers SET question_id = :question_id, answer_text = :answer_text, is_correct = :is_correct WHERE answer_id = :answer_id;`,
    add: `INSERT INTO Answers (question_id, answer_text, is_correct) VALUES (:question_id, :answer_text, :is_correct);`
  },
  question: {
    get: `SELECT * FROM Questions`,
    getFromId: `SELECT question_id, question_text, question_type FROM Questions WHERE quiz_id = :quiz_id;`,
    getRandomFromId: `SELECT * FROM Questions WHERE quiz_id = :quiz_id ORDER BY RAND();`,
    delete: `DELETE FROM Questions WHERE question_id = :question_id;`,
    update: `UPDATE Questions SET quiz_id = :quiz_id, question_text = :question_text, question_type = :question_type, image_url = :image_url, explanation = :explanation, hint = :hint, points = :points, question_order = :question_order WHERE question_id = :question_id`,
    add: `INSERT INTO Questions (quiz_id, question_text, question_type, image_url, explanation, hint, points, question_order) VALUES (:quiz_id, :question_text, :question_type, :image_url, :explanation, :hint, :points, :question_order);`
  },
  user: {
    get: `SELECT * FROM Users`,
    getMinimum: `SELECT user_id, username, avatar_url FROM Users WHERE user_id IN (:user_ids);`,
    getTopTen: `SELECT u.username, SUM(s.score) AS total_score FROM Users u JOIN UserScores s ON u.user_id = s.user_id GROUP BY u.user_id ORDER BY total_score DESC LIMIT 10;`,
    getQuizHistory: `SELECT q.title, s.score, s.max_possible_score, s.completed_at FROM UserScores s JOIN Quizzes q ON s.quiz_id = q.quiz_id WHERE s.user_id = :user_id ORDER BY s.completed_at DESC;`,
    delete: `DELETE FROM Users where user_id = :user_id`,
    update: `UPDATE Users SET username = :username, email = :email, password_hash = :password_hash, avatar_url = :avatar_url, created_at = :created_at, last_login = :last_login, is_admin = :is_admin WHERE user_id = :user_id`,
    add: `INSERT INTO Users (username, email, password_hash, is_admin) VALUES (:username, :email, :password_hash, :is_admin);`,
    getFromLogin: `SELECT * FROM Users where username like :username;`,
    getFromEmail: `SELECT * FROM Users where email like :email;`,
    log: `Update Users set last_login = CURRENT_TIMESTAMP() WHERE user_id = :user_id;`,
  },
  comment: {
    get: `SELECT * FROM QuizComments where quiz_id = :quiz_id;`,
    add: `INSERT INTO QuizComments (quiz_id, user_id, comment_text, rating, created_at) VALUES (:quiz_id, :user_id, :comment_text, :rating, CURRENT_TIMESTAMP())`
  },
  userScore: {
    add: `INSERT INTO UserScores (score_id, user_id, quiz_id, score, max_possible_score, completed_at)
          VALUES (:score_id, :user_id, :quiz_id, :score, :max_possible_score, CURRENT_TIMESTAMP());`,
    get: ""
  },
};

export const saltRounds = 10;