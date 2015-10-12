@extends('_layout')
@section('content')
    <div class="form">
        <label for="room-id" class="hidden">Room ID</label>
        <input placeholder="Enter room id" type="text" id="room-id" class="form-input">
        <button class="button main-button">Join Party!</button>
        <button class="button main-button">Start a party!</button>
    </div>
    <div class="disclaimer">
        <p><a href="{{ url('/login') }}">Login</a> here or if you are a new user you might want to <a href="{{ url('/register') }}">register</a> first!</p>
    </div>
@endsection