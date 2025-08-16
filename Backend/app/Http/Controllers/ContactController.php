<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMail;

class ContactController extends Controller
{
    public function sendMessage(Request $request)
    {
        $request->validate([
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'email' => 'required|email',
            'mobile' => 'nullable|string',
            'message' => 'required|string',
        ]);

        Mail::to('livecricketauction@gmail.com')->send(new ContactMail($request->all()));

        return response()->json(['message' => 'Message sent successfully!'], 200);
    }
}

