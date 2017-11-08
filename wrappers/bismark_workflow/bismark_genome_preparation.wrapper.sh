GENOME="${genome_dir}"

if [ "$GENOME" ] && [ -f "$GENOME" ]
then 
	TMP_GENOME_DIR=$(tar -tzf "$GENOME" | head -1)
	if [ "$TMP_GENOME_DIR" ]
	then
		tar -xzvf "$GENOME" 
		rm -rf "$GENOME"
		mv "$TMP_GENOME_DIR" "$GENOME"
	else
		mkdir tmp_genome_dir
		mv "$GENOME" tmp_genome_dir
		mv tmp_genome_dir "$GENOME"
	fi
fi

echo bismark_genome_preparation --yes --bowtie2 --verbose "$GENOME"
singularity exec -B /scratch:/scratch /scratch/tacc/images/bismark-2016-02-26-c138651612dd.img bismark_genome_preparation --yes --bowtie2 --verbose "$GENOME"
mv "$GENOME" bismark_genome_preparation_output

# Now, delete the bin/ directory
#rm -rf bismark_genome_preparation_output
rm -rf bin app.json job.json test.sh test.tgz wrapper.sh *.ipcexe
