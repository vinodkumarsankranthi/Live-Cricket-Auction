<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getAllUsers(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(User::where('role', 'user')->get());
    }

    public function updateUserPlan(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'plan' => 'required|in:bronze,silver,gold,platinum,premium,premium_Plus'
        ]);

        $user = User::findOrFail($id);
        $user->plan = $request->plan;
        $user->save();

        return response()->json(['message' => 'User plan updated']);
    }
}

