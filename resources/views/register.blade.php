@extends('_layout')
@section('content')
    <div class="form">
        <div class="form-wrapper">
            <label for="firstname" class="form-label">First name</label>
            <input placeholder="John" type="text" id="firstname" class="form-input">
        </div>
        <div class="form-wrapper">
            <label for="lastname" class="form-label">Last name</label>
            <input placeholder="Doe" type="text" id="lastname" class="form-input">
        </div>
        <div class="form-wrapper">
            <label for="username" class="form-label">Username</label>
            <input placeholder="JohnDoe456" type="text" id="username" class="form-input">
        </div>
        <div class="form-wrapper">
            <label for="email" class="form-label">Email</label>
            <input placeholder="johndoe456@gmail.com" type="email" id="email" class="form-input">
        </div>
        <div class="form-wrapper">
            <label for="password" class="form-label">Password</label>
            <input placeholder="**********" type="password" id="password" class="form-input">
        </div>
        <div class="form-wrapper">
            <label for="password_repeat" class="form-label">Repeat password</label>
            <input placeholder="**********" type="password" id="password_repeat" class="form-input">
        </div>
        <button class="button main-button">Register</button>
    </div>
    <div class="disclaimer">
        <p>You could also <a href="{{ url('/login') }}">login</a> or return to the <a href="{{ url('/') }}">main menu</a>.</p>
    </div>
@endsection