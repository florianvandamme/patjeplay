<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Patje Play</title>
    <link rel="stylesheet" href="{{ asset('css/site.css') }}">
    <link href='https://fonts.googleapis.com/css?family=Lato:400,300,100' rel='stylesheet' type='text/css'>
</head>
<body>
<div class="container">
    <h1>Patje Play</h1>
    @yield('content')
</div>
<script src="{{ asset('js/site.js') }}"></script>
</body>
</html>