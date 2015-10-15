package Agave::Client::Exceptions;

use Exception::Class (
    'Agave::Exceptions',
    'Agave::Exceptions::AuthFailed' =>
        { isa => 'Agave::Exceptions' },

    'Agave::Exceptions::InvalidRequest' =>
        { isa => 'Agave::Exceptions' },
    'Agave::Exceptions::InvalidEndPoint' =>
        { isa => 'Agave::Exceptions::InvalidRequest' },
    'Agave::Exceptions::InvalidArguments' =>
        { isa => 'Agave::Exceptions::InvalidRequest' },

    'Agave::Exceptions::HTTPError' =>
        { isa => 'Agave::Exceptions', fields => [qw/code message content/] },

);

1;
