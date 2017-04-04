package iPC::Addon;

use warnings;
use strict;
use Dancer ':syntax';
use Dancer::Plugin::Auth::CAS;

*Dancer::Plugin::Auth::CAS::_map_attributes=sub {
    my ( $doc, $mapping ) = @_;

    my $attrs = {};

    my $result = $doc->find( '/cas:serviceResponse/cas:authenticationSuccess' );
    if( $result ) { 
        my $node = $result->get_node(1);

				my $user=$node->findvalue( "./cas:user" );
				$attrs->{username}=$user;

        # extra all attributes
        my @attributes = $node->findnodes( "./cas:attributes/*" );
        foreach my $a (@attributes) {
            my $name = (split(/:/, $a->nodeName, 2))[1];
            my $val = $a->textContent;

            my $mapped_name = $mapping->{ $name } // $name;
            $attrs->{ $mapped_name } = $val;
        }
            
    }
    debug "Mapped attributes: ".to_dumper( $attrs );
    return $attrs;
};

1;
