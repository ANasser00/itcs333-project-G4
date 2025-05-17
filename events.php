<?php
header("Content-Type: application/json");
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM events ORDER BY event_date DESC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->title) || !isset($data->event_date)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing title or date"]);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO events (title, description, event_date) VALUES (?, ?, ?)");
        $stmt->execute([$data->title, $data->description ?? '', $data->event_date]);
        echo json_encode(["message" => "Event added successfully"]);
        break;

    case 'PUT':
        parse_str(file_get_contents("php://input"), $_PUT);
        $id = $_PUT['id'] ?? null;
        $title = $_PUT['title'] ?? null;
        $desc = $_PUT['description'] ?? '';
        $date = $_PUT['event_date'] ?? null;

        if (!$id || !$title || !$date) {
            http_response_code(400);
            echo json_encode(["error" => "Missing fields"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE events SET title=?, description=?, event_date=? WHERE id=?");
        $stmt->execute([$title, $desc, $date, $id]);
        echo json_encode(["message" => "Event updated successfully"]);
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $_DELETE);
        $id = $_DELETE['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing event ID"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM events WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Event deleted successfully"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
?>