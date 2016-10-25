package Agave::Client::Object::File;


=head1 NAME

Agave::Client::Object::File

=head1 VERSION

Version 0.10

=cut

use overload '""' => sub { $_[0]->path; };

our $VERSION = '0.10';

=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use Agave::Client::IO;

    my $apif = Agave::Client->new;
    my $io = $apif->io;
    my @files = $io->list($path);
	my $file = $files[0];
    print $file->uuid, "\n"; # not always available
    print $file->owner, "\n";
    print "File ", $file->name, " is a ", $file->is_folder ? "directory" : "file", ".\n";

	# share a file to other iPlant user
    ...

=head1 METHODS

=head2 new

=cut

sub new {
	my ($proto, $args) = @_;
	my $class = ref($proto) || $proto;
	
	my $self  = { map {$_ => $args->{$_}} keys %$args};
	
    # compute UUID
    # if not set by Agave, let's see if we get it from the metadata link
    unless ($self->{uuid} && defined $self->{_links}) {
        my $links = $self->{_links};
        my $uuid = undef;
        for my $k (keys %$links) {
            last if ( $links->{$k}->{href}
                && (($uuid) = $links->{$k}->{href} =~ /q=.*associationIds.*\%22(.*?)\%22/)
            );
        }
        $self->{uuid} = $uuid;
    }

	return bless($self, $class);
}

sub owner {
	my ($self) = @_;
	return $self->{owner};
}

sub name {
	my ($self) = @_;
	return $self->{name};
}


sub path {
	my ($self) = @_;
	return $self->{path};
}


sub size {
	my ($self) = @_;
	return $self->{length};
}


sub type {
	my ($self) = @_;
	return $self->{type};
}

sub format {
	my ($self) = @_;
	return $self->{format};	
}


sub is_file {
	my ($self) = @_;
	return $self->type eq 'file' && $self->format ne 'folder';
}


sub is_folder {
	my ($self) = @_;
	return $self->type eq 'dir' || $self->format eq 'folder';
}

sub last_modified {
	my ($self) = @_;
	return $self->{lastModified};
}

sub uuid {
	my ($self) = @_;
    return $self->{uuid};
}

sub TO_JSON {
	my $self = shift;
	return { map {$_ => $self->{$_}} keys %$self};
}


1; # End of Agave::Client::Object::File
