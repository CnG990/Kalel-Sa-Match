<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function trackEvent(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Événement enregistré'
        ]);
    }

    public function trackEventsBatch(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Événements enregistrés'
        ]);
    }

    public function trackPerformance(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Performance enregistrée'
        ]);
    }

    public function trackError(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Erreur enregistrée'
        ]);
    }
} 