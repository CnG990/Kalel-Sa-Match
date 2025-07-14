<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    public function unreadCount()
    {
        return response()->json([
            'success' => true,
            'data' => ['count' => 0]
        ]);
    }

    public function markAsRead($id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue'
        ]);
    }

    public function markAllAsRead()
    {
        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications marquées comme lues'
        ]);
    }

    public function destroy($id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Notification supprimée'
        ]);
    }
} 