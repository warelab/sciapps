package iPC::SciApps::Apps;

use warnings;
use strict;

use Dancer ':syntax';

prefix '/apps';

ajax '/' => sub {
	my $app_list=retrieveApps();
	foreach (@$app_list) {
		my $tag=$_->{isPublic} ? 'Public' : 'Private';
		$_->{tags}||=[];
		push @{$_->{tags}}, $tag;
	}
	to_json($app_list);
};

get '/' => sub {
	my $app_list=retrieveApps();

 	template 'apps', {
 		list => $app_list,
	};
};

ajax '/:id' => sub {
	my $app_id = param("id");
	my $app=retrieveApps($app_id);
	#print STDERR to_dumper($app);
	to_json($app);
};

get '/:id' => sub {
	my $app_id = param("id");
	my $app=retrieveApps($app_id);
	my ($inputs, $parameters) = ([], []);
	if ($app) {
		$inputs = $app->inputs;
		$parameters = $app->parameters;
	}
 	template 'app', {
 		app => $app,
		app_inputs => $inputs,
		app_params => $parameters,
		id => param("id"),
	};
};

sub retrieveApps {
	my ($app_id)=@_;
	my $api = getAgaveClient();
	my $apps = $api->apps;
	my $return = $app_id ? $apps->find_by_id($app_id) : $apps->list;
}

1;
