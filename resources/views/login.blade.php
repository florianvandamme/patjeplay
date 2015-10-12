@extends('_layout')
@section('content')
    <div class="form">
        <div class="form-wrapper">
            <label for="username" class="form-label">Username</label>
            <input placeholder="JohnDoe456" type="text" id="username" class="form-input">
        </div>
        <div class="form-wrapper">
            <label for="password" class="form-label">Password</label>
            <input placeholder="**********" type="password" id="password" class="form-input">
        </div>
        <button class="button main-button">Login</button>
    </div>
    <div class="disclaimer">
        <p>If you are a new user you should <a href="{{ url('/register') }}">register</a> first or you can return to the <a href="{{ url('/') }}">main menu</a>.</p>
    </div>
@endsection