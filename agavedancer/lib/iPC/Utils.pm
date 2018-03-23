package iPC::Utils;

sub uuid {
	my $s='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
	my $f=sub {
		my $r=rand()*16|0;
		my $v=$_[0] eq 'x' ? $r : ($r&0x3|0x8);
		return sprintf("%x", $v);
	};
	$s=~s/[xy]/$f->($&)/ge;
	return $s;
}

sub check_uuid {
	my $id=shift;
	$id=~/^[0-9a-f]{8,}-(?:[0-9a-f]{4,}-){2,}[0-9a-f]{3,}$/ ? 1 : 0;
}

sub tempname {
	my @CHARS = (qw/
		A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
		a b c d e f g h i j k l m n o p q r s t u v w x y z
		0 1 2 3 4 5 6 7 8 9 _
	/);
	join("", map { $CHARS[ int( rand( @CHARS ) ) ] } (1 .. 10));
}

sub cmp_maxRunTime {
	my @t=@_;
	s/://g foreach @t;
	$t[0] <=> $t[1];
}

sub parse_ils {
	my ($ils, $datastore_root)=@_;
	my $path=shift @$ils;
	$path=~m#^$datastore_root/?(.*):#;
	my @content;
	my %result=($1 => \@content);
	$path=$datastore_root . ($1 ? '/' . $1 : '');
	my %seen;
	foreach my $line (@$ils) {
		my ($name, $type);
		if ($line=~m#^\s+C\-\s+$path/(.*)#) {
			$name=$1;
			$name=~s/\s+$//;
			$type='dir';
		} else {
			my @f=split /\s+/, $line, 8;
			$name=$f[7];
			$type='file';
		}
		$seen{$name}++ or
		push @content, +{
			name	=> $name,
			type	=> $type,	
			path	=> $path . '/' . $name, 
		};
	}
	\%result;
}

sub parse_ls {
	my ($ls, $file_root)=@_;
	my $regex=qr#^$file_root/?(.*):#;
	my %result;
	#shift @$ls;
	my $path;
	foreach (@$ls) {
		chomp;
		if (m/$regex/) {
			$path=$1;
			$result{$path}=[];
		} else {
			my (@f)=split /\s+/;
			if ($#f >= 8) {
				push @{$result{$path}}, +{
					length  => $f[4],
					name  => $f[8],
					type  => substr($f[0], 0, 1) eq 'd' ? 'dir' : 'file',
					path	=> $path . '/' . $f[8],
				};
			}
		}
	}
	\%result;
}

sub transform_url {
	my ($data, $archive_system)=@_;
	if ($data=~m#^https://\w+.sciapps.org/results/job-(\w+\-\w+\-\w+\-\w+)[^\/]*/(.*)#) {
		$data='https://agave.iplantc.org/jobs/v2/' . $1 . '/outputs/media/' . $2;
	} elsif ($data=~m#^http://datacommons.cyverse.org/browse/iplant/home/#) {
		$data=~s#^http://datacommons.cyverse.org/browse/iplant/home/#agave://$archive_system/#;
	}
	$data;
}


1;
