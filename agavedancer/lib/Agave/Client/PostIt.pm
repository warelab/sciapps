package Agave::Client::PostIt;

use warnings;
use strict;
use Carp;
#use HTTP::Request::Common qw(POST);
use URI::Escape;
use Try::Tiny;
use Data::Dumper;

use base qw/Agave::Client::Base/;

{

	sub create {
		my ($self, %params) = @_;

		my %sparams = ();
		$sparams{url} = $params{url};
		$sparams{method} = $params{method} || 'GET';
		$sparams{maxUses} = $params{maxUses} || 1;
		$sparams{lifetime} = $params{lifetime} || '';
		#$sparams{noauth} = $params{noauth};

		my $resp  = try {
				$self->do_post('/', %sparams);
			}
			catch {
				$self->_error('PostIt::create: Unable to create postit', $_);
			};
		return ref $resp ? $resp : {status => 'error'};
	}

}

1;
