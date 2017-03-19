package iPC::Exceptions;

use Exception::Class (
    'iPC::Exceptions',
    'iPC::Exceptions::InvalidRequest' =>
        { isa => 'iPC::Exceptions' },
);

1;

