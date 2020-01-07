package Agave::Client::Apps;

use warnings;
use strict;

use base qw/Agave::Client::Base/;

use Agave::Client::Object::Application ();
use Try::Tiny;

=head1 NAME

Agave::Client::Apps - The great new Agave::Client::Apps!

=head1 VERSION

Version 0.03

=cut

our $VERSION = '0.03';


=head1 SYNOPSIS

This module gives you basic access to Agave's APPS end point.

Perhaps a little code snippet.

    use Agave::Client::Apps;

    $apps = Agave::Client::Apps->list;

    $app = Agave::Client::Apps->find_by_id('app-id');

    $permissions = Agave::Client::Apps->pems('app-id');
    
    $rc = Agave::Client::Apps->pems_update('app-id', $username, $permission);

    ...

=head1 METHODS

=head2 list

List available apps. If unauthenticated, it lists only the public apps, otherwise it lists private, shared and public apps.

=cut

# retrieve a list of the available applications
sub list {
    my ($self, %params) = @_;

    my @applications = ();

    if (! %params) {
        %params = (limit => 100, offset => 0);
    }
    $params{limit} //= 100;
    $params{offset} //= 0;

    my $list = $self->do_get('/?limit=' . $params{limit} . "&offset=" . $params{offset});
    if ($list && 'ARRAY' eq ref $list) {
        push @applications, map { new Agave::Client::Object::Application($_) } @$list;
    }

    wantarray ? @applications : \@applications;
}


sub find_by_name {
	my ($self, $name) = @_;
	my @applications = ();

	if ($name) {
        my $list = $self->do_get('/name/' . $name);
        if ($list && 'ARRAY' eq ref $list) {
            push @applications, map { new Agave::Client::Object::Application($_) } @$list;
        }
    }

    wantarray ? @applications : \@applications;
}

=head2 find_by_id

Returns an Agave app

=cut

sub find_by_id {
	my ($self, $app_id) = @_;
	my @applications = ();

	if ($app_id) {
		my $app = try {
            $self->do_get('/' . $app_id);
        } catch {
            return ();
        };

		if ($app && 'HASH' eq ref $app) {
			push @applications, map { new Agave::Client::Object::Application($_) } ($app);
		}
	}
	wantarray ? @applications : $applications[0];
}

=head2 pems

Returns the permissions for the named app. (Arrayref of hashrefs)

=cut

sub pems {
    my ($self, $app_id) = @_;

    return [] unless ($app_id);

    my $path = join("/", "", $app_id, "pems");

    $self->do_get($path);
}



=head2 pems_update

Sets persmissions to an app to a Cyverse user. 

    $class->pems_update('super-duper-app-0.0.1', 'ghiban', [ $permission ]);

    where $permission is one of the following:

        READ
        WRITE
        EXECUTE
        READ_WRITE
        READ_EXECUTE (default)
        WRITE_EXECUTE
        ALL
        NONE

=cut

sub pems_update {

    my ($self, $app_id, $username, $perm) = @_;

    $perm ||= "READ_EXECUTE";

    return unless $perm =~ /^(?:READ|WRITE|EXECUTE|READ_WRITE|READ_EXECUTE|WRITE_EXECUTE|ALL|NONE)$/i;
    return unless ($app_id && $username);

    my $path = join("/", "", $app_id, "pems", $username);

    $self->do_post($path, permission => uc $perm);
}



=head2 pems_delete

Removes all permissions for a (user, app)
    
=cut

sub pems_delete {
    my ($self, $app_id, $username) = @_;

    $self->pems_update($app_id, $username, 'NONE');
}


=head1 AUTHOR


    Cornel Ghiban, C<< <ghiban at cshl.edu> >>


=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc Agave::Client::Apps


=head1 ACKNOWLEDGEMENTS


=head1 COPYRIGHT & LICENSE

Copyright 2018 Cornel Ghiban.

This program is free software; you can redistribute it and/or modify it
under the terms of either: the GNU General Public License as published
by the Free Software Foundation; or the Artistic License.

See http://dev.perl.org/licenses/ for more information.


=cut

1; # End of Agave::Client::Apps
