<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function conversations()
    {
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    public function createConversation(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Conversation créée'
        ]);
    }

    public function getMessages($id)
    {
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    public function sendMessage(Request $request, $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Message envoyé'
        ]);
    }

    public function markAsRead($id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Message marqué comme lu'
        ]);
    }
} 