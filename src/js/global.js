(function() {
    window.addEventListener('DOMContentLoaded', function() {
        if ( window.location.protocol.indexOf('s') < 0) {
            window.location.protocol = 'https';
        }
    });
})();