#!/usr/bin/env perl
use Dancer;
use iPC::SciApps;

chdir(setting('appdir'));
start;
