package Agave::Client::Object::OutputFile;

=head1 NAME

Agave::Client::Object::OutputFile

=head1 VERSION

Version 0.01

=cut

use base qw/Agave::Client::Object::File/;

our $VERSION = '0.01';

sub new {
	my ($proto, $args) = @_;
	my $class = ref($proto) || $proto;

	
	my $self  = { map {$_ => $args->{$_}} keys %$args};

	if (defined $$self{_links} && defined $$self{_links}{parent}
			&& $$self{_links}{parent}{href} =~ m{jobs/v\d+/([a-f0-9-]+)$}
	) {
		$self->{job_id} = $1;
	}

	bless($self, $class);

	return $self;
}

sub virtual_path {
	my $self = shift;
	my $vpath = '';

	if ($self && $self->{job_id}) {
		$vpath = sprintf("https://agave.iplantc.org/jobs/v2/%s/outputs/media%s", $self->{job_id}, $self->{path});
	}

	return $vpath;
}

sub job {
	my $self = shift;
	$self->{job_id} if $self;
}

1; # End of Agave::Client::Object::OutputFile
