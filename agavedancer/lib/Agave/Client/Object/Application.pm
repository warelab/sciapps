package Agave::Client::Object::Application;

use overload '""' => sub { $_[0]->id; };

=head1 NAME

Agave::Client::Object::Application - The great new Agave::Client::Object::Application!

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';

=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use Agave::Client;

    my $apif = Agave::Client->new;
    my $apps = $apif->apps;
    my $applications = $apps->list;
    print $applications[0]->id;
    ...

=head1 METHODS

=head2 new

=cut


sub new {
	my ($proto, $args) = @_;
	my $class = ref($proto) || $proto;
	
	my $self  = { map {$_ => $args->{$_}} keys %$args};
	
	
	bless($self, $class);
	
	
	return $self;
}

sub name {
	my ($self) = @_;
	return $self->{name};
}

sub id {
	my ($self) = @_;
	return $self->{id};
}

# returns a list of output files
#
sub outputs {
	my ($self) = @_;

	my $o = $self->{outputs};
	wantarray ? @$o : $o;
}

#
#
sub inputs {
	my ($self) = @_;
	my $i = $self->{inputs};
	wantarray ? @$i : $i;
}


sub helpURI {
	my ($self) = @_;
	return $self->{helpURI};
}

sub shortDescription {
	my ($self) = @_;
	return $self->{shortDescription};	
}


sub parameters {
	my ($self) = @_;
	my $p = $self->{parameters};
	wantarray ? @$p : $p;
}

sub parallelism {
	my ($self) = @_;
	return $self->{parallelism};
}

# sub details {
# 	my ($self) = @_;
# 	return $self->{details};
# }

sub TO_JSON {
	my $self = shift;
	my $href = { map {$_ => $self->{$_}} keys %$self};
	return $href;
}

1; # End of Agave::Client::Object::Application
