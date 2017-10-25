package Agave::Client::Apps;

use warnings;
use strict;

use base qw/Agave::Client::Base/;

use Agave::Client::Object::Application ();
use Try::Tiny;

=head1 NAME

Agave::Client::Apps - The great new Agave::Client::Apps!

=head1 VERSION

Version 0.02

=cut

our $VERSION = '0.02';


=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use Agave::Client::Apps;

    my $foo = Agave::Client::Apps->new();
    ...

=head1 METHODS

=head2 list

	List available apps. If unauthenticated, it lists only the public apps, otherwise 
	it lists private, shared and public apps.

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

=head2 find_by_name

=cut

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



=head1 AUTHOR

Cornel Ghiban, C<< <ghiban at cshl.edu> >>

=head1 BUGS

Please report any bugs or feature requests to C<bug-iplant-foundationalapi at rt.cpan.org>, or through
the web interface at L<http://rt.cpan.org/NoAuth/ReportBug.html?Queue=iPlant-FoundationalAPI>.  I will be notified, and then you'll
automatically be notified of progress on your bug as I make changes.




=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc Agave::Client::Apps


You can also look for information at:

=over 4

=item * RT: CPAN's request tracker

L<http://rt.cpan.org/NoAuth/Bugs.html?Dist=iPlant-FoundationalAPI>

=item * AnnoCPAN: Annotated CPAN documentation

L<http://annocpan.org/dist/iPlant-FoundationalAPI>

=item * CPAN Ratings

L<http://cpanratings.perl.org/d/iPlant-FoundationalAPI>

=item * Search CPAN

L<http://search.cpan.org/dist/iPlant-FoundationalAPI/>

=back


=head1 ACKNOWLEDGEMENTS


=head1 COPYRIGHT & LICENSE

Copyright 2011 Cornel Ghiban.

This program is free software; you can redistribute it and/or modify it
under the terms of either: the GNU General Public License as published
by the Free Software Foundation; or the Artistic License.

See http://dev.perl.org/licenses/ for more information.


=cut

1; # End of Agave::Client::Apps
