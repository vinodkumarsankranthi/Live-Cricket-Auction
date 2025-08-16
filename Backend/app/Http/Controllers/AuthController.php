<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class AuthController extends Controller
{
public function register(Request $request)
{
    $validated = $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users',
        'phone' => 'required',
        'password' => 'required|min:6',
        'otp' => 'required'
    ]);

       // Verify OTP from cache
    $cachedOtp = Cache::get('signup_otp_' . $validated['email']);
    if ($cachedOtp != $validated['otp']) {
        return response()->json(['message' => 'OTP verification failed'], 400);
    }

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'phone' => $validated['phone'],
        'password' => Hash::make($validated['password']),
        'plan' => 'bronze',
        'role' => 'user'
    ]);

    Cache::forget('signup_otp_' . $validated['email']); 

    return response()->json([
        'token' => $user->createToken('auth_token')->plainTextToken,
        'user' => $user
    ]);
}

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'No user found please Register'], 401);
        }

        return response()->json([
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user' => $user
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function upgradePlan(Request $request)
    {
        $request->validate([
        'plan' => 'required|in:bronze,silver,gold,platinum,premium,premium_Plus'
        ]);

        $request->user()->update(['plan' => $request->plan]);
        return response()->json(['message' => 'Plan upgraded']);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function updateProfile(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $request->user()->id,
        'phone' => 'required|string|max:15',
        'city' => 'nullable|string|max:100',
        'password' => 'nullable|min:6|confirmed',
        'old_password' => 'required_with:password',
    ]);

    $user = $request->user();

    // Verify old password
    if (!empty($validated['password'])) {
        if (!Hash::check($validated['old_password'], $user->password)) {
            return response()->json(['message' => 'Old password is incorrect'], 400);
        }
    }

    $updateData = [
        'name' => $validated['name'],
        'email' => $validated['email'],
        'phone' => $validated['phone'],
        'city' => $validated['city'],
    ];

    if (!empty($validated['password'])) {
        $updateData['password'] = Hash::make($validated['password']);
    }

    $user->update($updateData);

    return response()->json([
        'message' => 'Profile updated successfully',
        'user' => $user
    ]);
}

public function sendOtp(Request $request)
{
    $request->validate(['email' => 'required|email']);
    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'Email not registered'], 404);
    }

    $otp = rand(100000, 999999);
    Cache::put('otp_' . $request->email, $otp, now()->addMinutes(5));

    // Send OTP email
    Mail::to($request->email)->send(new OtpMail($otp));

    Log::info("OTP for {$request->email}: $otp");

    return response()->json(['message' => 'OTP sent to email']);
}


public function verifyOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'otp' => 'required|string'
    ]);

    $cacheKey = 'otp_' . $request->email;
    $cachedOtp = Cache::get($cacheKey);

    if (!$cachedOtp) {
        return response()->json(['message' => 'OTP expired or not found. Please request a new one.'], 400);
    }

    if ($cachedOtp === $request->otp) {
        return response()->json(['message' => 'OTP verified']);
    }

    return response()->json(['message' => 'OTP verification failed. Please enter the correct OTP.'], 400);
}


public function resetPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|min:6'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'Email not found'], 404);
    }

    if (!Cache::has('otp_' . $request->email)) {
        return response()->json(['message' => 'OTP verification required'], 403);
    }

    $user->password = bcrypt($request->password);
    $user->save();

    Cache::forget('otp_' . $request->email);

    return response()->json(['message' => 'Password reset successfully']);
}

public function sendSignupOtp(Request $request)
{
    $request->validate(['email' => 'required|email|unique:users,email']);

    $otp = rand(100000, 999999);
    Cache::put('signup_otp_' . $request->email, $otp, now()->addMinutes(10));

    Mail::to($request->email)->send(new OtpMail($otp));

    return response()->json(['message' => 'OTP sent for verification']);
}

public function verifySignupOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'otp' => 'required'
    ]);

    $cachedOtp = Cache::get('signup_otp_' . $request->email);

    if ($cachedOtp == $request->otp) {
        return response()->json(['message' => 'OTP verified']);
    }

    return response()->json(['message' => 'Invalid or expired OTP'], 400);
}
}
